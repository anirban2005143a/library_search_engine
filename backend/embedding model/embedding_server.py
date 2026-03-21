# file: api_server.py
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
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