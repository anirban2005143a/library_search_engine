# file: api_server.py
from fastapi import FastAPI , UploadFile, File, HTTPException
from pydantic import BaseModel 
from typing import List , Dict , Any
import numpy as np
import pandas as pd
import io
import uuid
from ranx import Run, fuse
from embedding_model.model import get_sentence_embeddings
from cross_encoder.model import get_cross_encoding_score
from intent_detect import get_search_query_intent , clean_query_for_nlp


# 2️⃣ Define request schema
class SentencesRequest(BaseModel):
    sentences: list[str]

class QueryIntentRequest(BaseModel):
    query: str

class CleanQueryRequest(BaseModel):
    query: str

class RerankRequest(BaseModel):
    query: str
    documents: list[dict] # Expected: [{"id": "1", "text": "book title and desc"}, ...]

# -------- Request schema --------
class FusionRequest(BaseModel):
    multi_match: List[Dict[str, Any]]
    knn_query: List[Dict[str, Any]]
    knn_title_seed: List[Dict[str, Any]] = []
    knn_context_seed: List[Dict[str, Any]] = []
    intent: str

# 3️⃣ Create FastAPI app
app = FastAPI(title="Sentence Embedding API")

def hits_to_run_dict(hits):
    run_dict = {}
    for hit in hits:
        doc_id = hit["_id"]
        score = hit["_score"]
        run_dict[doc_id] = score
    return run_dict

@app.get("/")
def home():
    
    return "running"

# 4️⃣ POST endpoint to get embeddings
@app.post("/embedding")
def embed_sentences(request: SentencesRequest):
    try:
        sentences = request.sentences
        if not sentences:
            return {"error": "No sentences provided."}

        print("embedding sentence first sample: " , sentences[0][0:20] )
        # Encode sentences
        embeddings = get_sentence_embeddings(sentences, return_similarity=True)

        # Convert numpy arrays to lists for JSON serialization
        embeddings_list = embeddings["embeddings"].tolist()

        return {"embeddings": embeddings_list, "count": len(sentences)}
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search-intent")
async def get_intent(request: QueryIntentRequest):
    try:
        query = request.query
        return get_search_query_intent(query_text=query)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clean-query")
async def get_intent(request: CleanQueryRequest):
    try:
        query = request.query
        return clean_query_for_nlp(query=query)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/preprocess")
async def preprocess_file(file: UploadFile = File(...)):
    print("start processing data")
    try:
        colsRequired = ["title", "author", "categories", "thumbnail", "description", "pages", "publisher", "language", "link", "published_year" , "isbn"]  # change as needed
        filename = file.filename.lower()

        contents = await file.read()

        # 🔹 Read file into DataFrame
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        df.columns = df.columns.str.lower()        
        # 🔹 Ensure required columns exist
        for col in colsRequired:
            col = col.lower()  # ensure consistency
            if col not in df.columns:
                df[col] = "" # add missing column as string

        # 🔹 Keep only required columns
        df = df[colsRequired]

        # 🔹 Replace NaN/null with ""
        df = df.fillna("")

        # 🔹 Convert all to string (important)
        # df['isbn'] = df['isbn'].apply(lambda x: str(int(x)) if pd.notnull(x) else "")
        df = df.astype(str)

        # add unique ids to every books 
        df['id'] = [str(uuid.uuid4()) for _ in range(len(df))]

        # 🔹 Convert to JSON array
        result = df.to_dict(orient="records")

        # print(result[0])

        return result

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cross-encoder")
async def cross_encoder(request: RerankRequest):
    query = request.query
    docs = request.documents

    if not docs:
        return []
    
    try:
        # Code
        print("preparing sentence pair from request query")
        # Prepare pairs for the Cross-Encoder: [[query, doc1], [query, doc2]...]
        sentence_pairs = [[query, doc['text']] for doc in docs]

        print("creating cross encoding score")
        # Batched scoring
        scores = get_cross_encoding_score(sentence_pairs, batch_size=32)
            
        # Create a map of { doc_id: score }
        reranked_results = {}
        for i, doc in enumerate(docs):
            reranked_results[doc['id']] = float(scores[i])
            
        return reranked_results
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rrf-rank")
async def rrf_rerank(request : FusionRequest):

    print("calling for rrf score")
    query_id = "q1"
    try:

        # print(request.multi_match)
        # print(request.knn_query)
        # print(request.knn_title_seed)
        # print(request.knn_context_seed)

        # Convert ES hits → ranx format
        bm25_dict = hits_to_run_dict(request.multi_match)
        knn_dict = hits_to_run_dict(request.knn_query)
        title_seed_dict = hits_to_run_dict(request.knn_title_seed)
        context_seed_dict = hits_to_run_dict(request.knn_context_seed)

        # get search intent  
        intent = request.intent

        # Create Run objects
        runs = [
            Run({query_id: bm25_dict}),
            Run({query_id: knn_dict}),
        ]

        # Add optional runs only if present
        if title_seed_dict:
            runs.append(Run({query_id: title_seed_dict}))
        if context_seed_dict:
            runs.append(Run({query_id: context_seed_dict}))

        weights = [1.0 , 1.0 , 1.0 , 1.0]
        if intent == "NAVIGATIONAL_LOOKUP" or intent=="AUTHOR_SEARCH":
            # Strong BM25, weak semantic/seed
            weights = [1.0, 0.1, 0.8, 0.8] 
        else:
            # Descriptive Search: Strong semantic, balanced keywords/seed
            weights = [0.5, 1.0, 0.3, 0.8]

        
        combined_run = fuse(
            runs=runs,
            method="wsum",       # Use Weighted Sum
            norm="rank",         # This turns scores into reciprocal ranks (1/rank)
            params={
                "weights": weights # Now weights will work correctly
            }
        )

        return {
            "status": "success",
            "rerank_results": combined_run.to_dict()[query_id]
        }

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))