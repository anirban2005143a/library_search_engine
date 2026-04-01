from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch

model_dir = "./distilbert_search_intent_model"

# Load model and tokenizer
tokenizer = DistilBertTokenizer.from_pretrained(model_dir)
model = DistilBertForSequenceClassification.from_pretrained(model_dir)

# Put model in eval mode
model.eval()

texts = [
    "Please search for Grasping the Changing World",
    "I want Grasping the Changing World from 2002"
]

# Tokenize
inputs = tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors="pt")

# Get predictions
with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits
    predictions = torch.argmax(logits, dim=-1)

# Map back to labels
id_to_label = {v: k for k, v in label_map.items()}
pred_labels = [id_to_label[p.item()] for p in predictions]
print(pred_labels)