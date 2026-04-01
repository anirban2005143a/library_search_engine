from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset
import torch
import torch_xla.core.xla_model as xm

# ===== 1️⃣ Load dataset in streaming mode =====
dataset = load_dataset(
    'csv',
    data_files={'train': 'search_intent_train_subset.csv'},
    split='train',
    streaming=True
)

# ===== 2️⃣ Map labels to integer IDs =====
# First, extract unique labels
def get_labels(ds, label_col='label', sample_size=100_000):
    labels = set()
    for idx, row in enumerate(ds.take(sample_size)):
        labels.add(row[label_col])
    return list(labels)

unique_labels = get_labels(dataset)
label_map = {l: i for i, l in enumerate(unique_labels)}

def encode_labels(example):
    example['label'] = label_map[example['label']]
    return example

dataset = dataset.map(encode_labels)

# ===== 3️⃣ Tokenizer =====
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')

def tokenize_func(examples):
    return tokenizer(
        examples['text'],
        padding="max_length",
        truncation=True,
        max_length=128
    )

tokenized_dataset = dataset.map(tokenize_func, batched=True)

# ===== 4️⃣ Split train/test =====
# Streaming datasets do not support train_test_split directly,
# so we can take first 90% for train, last 10% for test
def split_dataset(ds, train_ratio=0.9):
    total = 5_000_000
    train_count = int(total * train_ratio)
    ds_train = ds.take(train_count)
    ds_test = ds.skip(train_count)
    return ds_train, ds_test

train_ds, test_ds = split_dataset(tokenized_dataset)

# ===== 5️⃣ Load model =====
model = DistilBertForSequenceClassification.from_pretrained(
    'distilbert-base-uncased',
    num_labels=len(label_map)
)

# ===== 6️⃣ TPU device =====
device = xm.xla_device()
model.to(device)

# ===== 7️⃣ Training arguments =====
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=2,
    per_device_train_batch_size=64,  # TPU-friendly
    logging_dir='./logs',
    logging_steps=500,
    save_strategy='epoch',
    fp16=True,  # mixed precision
    dataloader_drop_last=True
)

# ===== 8️⃣ Trainer =====
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_ds,
    eval_dataset=test_ds
)

# ===== 9️⃣ Train =====
trainer.train()

# ===== 10️⃣ Save model =====
model_dir = "./distilbert_search_intent_model"
trainer.save_model(model_dir)
tokenizer.save_pretrained(model_dir)