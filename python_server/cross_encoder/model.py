from sentence_transformers import CrossEncoder
import torch
import numpy as np 

# 'cpu' is explicit here. Ryzen 5000 handles this model easily.
model_name = 'cross-encoder/ms-marco-MiniLM-L-6-v2'
# model_name = 'BAAI/bge-reranker-base'
# model_name = 'mixedbread-ai/mxbai-rerank-large-v1' (Extremely good at distinguishing between books that sound similar but are in different genres.)
# Cohere Rerank (API): If you don't mind an API call, rerank-english-v3.0 is nearly impossible to fool with "The Finkler Question" type errors.

model = CrossEncoder(model_name, device='cpu')

def get_cross_encoding_score(sentence_pairs, batch_size=32):
    logits = model.predict(
        sentence_pairs,
        batch_size=batch_size,
        convert_to_numpy=True,
        show_progress_bar=True
    )
    # Apply sigmoid function: 1 / (1 + exp(-x))
    # probabilities = 1 / (1 + np.exp(-logits))
    return logits.tolist()
