from sentence_transformers import SentenceTransformer, util
import torch
import os
import re
import spacy
from typing import Dict
import re

# Optimized for Ryzen 5600 (12 threads)
torch.set_num_threads(12)

# Optional: Ensure OpenMP doesn't conflict
os.environ["OMP_NUM_THREADS"] = "12"
os.environ["MKL_NUM_THREADS"] = "12"

nlp = spacy.load("en_core_web_md")
# embedder = SentenceTransformer('all-MiniLM-L6-v2')
embedder = SentenceTransformer('all-mpnet-base-v2')

INTENT_LABELS = ["author search", "genre category", "plot description", "book title lookup"]
INTENT_EMBEDDINGS = embedder.encode(INTENT_LABELS, convert_to_tensor=True)

def get_search_query_intent(query_text : str) -> Dict :
    clean_query = clean_query_for_nlp(query=query_text)
    doc = nlp(clean_query)

    intent = "GENERAL_SEARCH"

    isbn_match = detect_isbn(clean_query)
    year_match = re.search(r'\b\d{4}\b', clean_query)
    persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]

    query_embedding = embedder.encode(clean_query, convert_to_tensor=True)
    cosine_scores = util.cos_sim(query_embedding, INTENT_EMBEDDINGS)[0]
    best_match_idx = torch.argmax(cosine_scores).item()
    top_intent = INTENT_LABELS[best_match_idx]

    if isbn_match:
        intent = "ISBN_SEARCH"

    elif year_match:
        intent = "YEAR_LOOKUP"

    if persons:
        intent = "AUTHOR_SEARCH"
    elif top_intent == "author search" and len(clean_query.split()) <= 4:  
        intent = "AUTHOR_SEARCH"

    elif top_intent == "genre category":
        intent = "GENRE_SEARCH"

    elif top_intent == "plot description" or (len(clean_query.split()) >= 4 and intent == "GENERAL_SEARCH"):
        intent = "DESCRIPTION_SEARCH"

    elif len(clean_query.split()) <= 4:
        intent = "TITLE_LOOKUP"

    return {
        "clean_query":clean_query,
        "intent" : intent
    }


def detect_isbn(query):
    
    isbn_regex = r'\b(?:97[89][-\s]?)?[0-9][-\s]?[0-9]{1,7}[-\s]?[0-9]{1,7}[-\s]?[0-9X]\b'
    
    match = re.search(isbn_regex, query, re.IGNORECASE)
    
    if match:
        raw_match = match.group(0)
        # Remove hyphens and spaces to check the true numerical length
        clean_isbn = re.sub(r'[-\s]', '', raw_match).upper()
        
        # Valid ISBNs are exactly 10 or 13 characters long
        if len(clean_isbn) == 10 or len(clean_isbn) == 13:
            return {
                "id": clean_isbn,
                "original_format": raw_match,
                "intent": "ISBN_SEARCH"
            }
            
    return None


def clean_query_for_nlp(query: str) -> str:
    query = query.strip()

    if re.fullmatch(r'\d{10,15}', query):
        return query

    query = query.lower()
    query = re.sub(r'[^\w\s\.\-]', '', query)

    query = re.sub(r'\s+', ' ', query).strip()

    doc = nlp(query)
    tokens = [
        token.text for token in doc
        if not token.is_stop and not token.is_punct and not token.is_space
    ]

    cleaned_query = " ".join(tokens)

    return cleaned_query.strip()