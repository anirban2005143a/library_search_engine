# file: api_server.py
from fastapi import FastAPI , UploadFile, File, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
import io
from model import get_sentence_embeddings

# 2️⃣ Define request schema
class SentencesRequest(BaseModel):
    sentences: list[str]

# 3️⃣ Create FastAPI app
app = FastAPI(title="Sentence Embedding API")

@app.get("/")
def home():
    
    return "running"

# 4️⃣ POST endpoint to get embeddings
@app.post("/embedding")
def embed_sentences(request: SentencesRequest):
    sentences = request.sentences
    if not sentences:
        return {"error": "No sentences provided."}

    # Encode sentences
    embeddings = get_sentence_embeddings(sentences, return_similarity=True)

    # Convert numpy arrays to lists for JSON serialization
    embeddings_list = embeddings["embeddings"].tolist()

    return {"embeddings": embeddings_list, "count": len(sentences)}


@app.post("/preprocess")
async def preprocess_file(file: UploadFile = File(...)):
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

        # 🔹 Ensure required columns exist
        for col in colsRequired:
            if col not in df.columns:
                df[col] = ""  # add missing column as string

        # 🔹 Keep only required columns
        df = df[colsRequired]

        # 🔹 Replace NaN/null with ""
        df = df.fillna("")

        # 🔹 Convert all to string (important)
        df['isbn'] = df['isbn'].apply(lambda x: str(int(x)) if pd.notnull(x) else "")
        df = df.astype(str)

        # 🔹 Convert to JSON array
        result = df.to_dict(orient="records")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))