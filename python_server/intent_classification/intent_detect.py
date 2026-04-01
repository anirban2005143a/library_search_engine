import os
import json
import logging
import torch
# import spacy
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# -----------------------------
# Logging setup
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# -----------------------------
# Config
# -----------------------------

# nlp = spacy.load("en_core_web_md")
MODEL_DIR = "../distilbert_search_intent_model"
MAX_LEN = 128
DEVICE = torch.device("cpu")  # Use "cuda" if GPU is available

# -----------------------------
# Optimize CPU usage
# -----------------------------
num_cores = max(1, os.cpu_count() - 1)  # 12 - 1 = 11 threads
torch.set_num_threads(num_cores)
torch.set_num_interop_threads(num_cores)
logger.info("Using %d CPU threads for inference", num_cores)

# -----------------------------
# Load model and tokenizer
# -----------------------------
logger.info("Loading model and tokenizer from '%s'...", MODEL_DIR)
tokenizer = DistilBertTokenizer.from_pretrained(MODEL_DIR)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)
model.to(DEVICE)
model.eval()
logger.info("Model and tokenizer loaded successfully.")

# -----------------------------
# Load label map
# -----------------------------
with open(os.path.join(MODEL_DIR, "label_map.json"), "r") as f:
    label_map = json.load(f)
id_to_label = {v: k for k, v in label_map.items()}

# -----------------------------
# Prediction function
# -----------------------------
def predict_search_query_intent(query: str) -> str:
    """
    Predict the intent of a single query using the loaded DistilBERT model.

    Args:
        query (str): The input query text.

    Returns:
        str: The predicted intent label.
    """
    if not query.strip():
        return "unknown"

    # Tokenize the query
    encoded_input = tokenizer(
        query,
        padding="max_length",
        truncation=True,
        max_length=MAX_LEN,
        return_tensors="pt"
    )

    # Move inputs to the correct device
    input_ids = encoded_input['input_ids'].to(DEVICE)
    attention_mask = encoded_input['attention_mask'].to(DEVICE)

    # Run inference
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        pred_id = torch.argmax(outputs.logits, dim=-1).item()

    # Map predicted ID to label
    return id_to_label.get(pred_id, "GENERAL_SEARCH")


def clean_search_query(query: str) -> str:
    query = query.strip()

    query = query.lower()
    query = re.sub(r'[^\w\s\.\-]', '', query)

    query = re.sub(r'\s+', ' ', query).strip()

    # doc = nlp(query)
    # tokens = [
    #     token.text for token in doc
    #     if not token.is_stop and not token.is_punct and not token.is_space
    # ]

    # cleaned_query = " ".join(tokens)

    return query.strip()


if __name__ == "__main__":
    query = "violence football fans europe narrative book"
    intent = predict_search_query_intent(query)
    print(f"Predicted intent: {intent}")