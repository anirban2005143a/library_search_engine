from pydantic import BaseModel , Field
from typing import List , Dict , Any , Optional


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
    bm25_dict: List[Dict[str, Any]]
    knn_title_dict: List[Dict[str, Any]]
    knn_context_dict: List[Dict[str, Any]] = []
    knn_title_seed: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    knn_context_seed: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    intent: str
