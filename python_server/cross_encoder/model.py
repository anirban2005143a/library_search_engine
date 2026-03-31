from sentence_transformers import CrossEncoder
import torch
import numpy as np 
import os

# Set threads to your logical count (12)
torch.set_num_threads(4)

# Optional: Ensure OpenMP doesn't conflict
os.environ["OMP_NUM_THREADS"] = "4"
os.environ["MKL_NUM_THREADS"] = "4"


# 'cpu' is explicit here. Ryzen 5000 handles this model easily.
# model_name = 'cross-encoder/ms-marco-MiniLM-L-6-v2'

# model_name = 'BAAI/bge-reranker-base'
# model_name = 'BAAI/bge-reranker-large'

# model_name = 'mixedbread-ai/mxbai-rerank-large-v1' # (Extremely good at distinguishing between books that sound similar but are in different genres.)
model_name = 'mixedbread-ai/mxbai-rerank-base-v1' # (Extremely good at distinguishing between books that sound similar but are in different genres.)
# model_name = 'mixedbread-ai/mxbai-rerank-large-v2' # (Extremely good at distinguishing between books that sound similar but are in different genres.)
# Cohere Rerank (API): If you don't mind an API call, rerank-english-v3.0 is nearly impossible to fool with "The Finkler Question" type errors.

model = None

def get_model():
    global model
    if model is None:
        model = CrossEncoder(
            model_name,
            device='cpu',
            # max_length=512
        )
        model.model.eval()
    return model

def get_cross_encoding_score(sentence_pairs, batch_size=8):
    model = get_model()
        
    with torch.no_grad():
        logits = model.predict(
            sentence_pairs,
            batch_size=batch_size,
            convert_to_numpy=True,
            show_progress_bar=False
        )
    
    return logits.tolist()
