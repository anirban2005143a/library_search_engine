# sentence_embedder.py
from sentence_transformers import SentenceTransformer, util
import torch

# Load the model once at startup
model_name = "BAAI/bge-base-en-v1.5"
model = SentenceTransformer(model_name)

def get_sentence_embeddings(sentences, batch_size=32, show_progress=True, return_similarity=False):
    """
    Encode sentences into embeddings and optionally compute cosine similarity matrix.

    Args:
        sentences (list[str]): list of sentences
        batch_size (int): batch size for encoding
        show_progress (bool): show tqdm progress bar
        return_similarity (bool): whether to return cosine similarity matrix

    Returns:
        embeddings (torch.Tensor or np.ndarray)
        similarity_matrix (optional, np.ndarray)
    """
    embeddings = model.encode(
        sentences,
        batch_size=batch_size,
        convert_to_tensor=True,
        show_progress_bar=show_progress
    )
    
    result = {"embeddings": embeddings.cpu().numpy()}  # convert to numpy for JS compatibility
    
    if return_similarity:
        similarity_matrix = util.cos_sim(embeddings, embeddings)
        result["similarity_matrix"] = similarity_matrix.cpu().numpy()
    
    return result

if __name__ == "__main__":
    
    sentences = [
        "The history of artificial intelligence.",
        "Machine learning is transforming the world."
    ]

    result = get_sentence_embeddings(sentences, return_similarity=True)
    print(result["embeddings"].shape)
    print(result["similarity_matrix"])