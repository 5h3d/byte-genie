import torch
from transformers import BartForConditionalGeneration, BartTokenizer, Trainer, TrainingArguments, DataCollatorForSeq2Seq
from datasets import load_dataset

# Clear any cached memory (helpful if using GPU)
torch.cuda.empty_cache()

# Initialize the tokenizer with a smaller model
tokenizer = BartTokenizer.from_pretrained('facebook/bart-base')

# Updated preprocess function
def preprocess_function(examples):
    # Tokenize the articles
    model_inputs = tokenizer(examples['article'], max_length=256, truncation=True, padding='max_length')

    # Tokenize the highlights separately
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples['highlights'], max_length=32, truncation=True, padding='max_length')
        model_inputs['labels'] = labels.input_ids

    return model_inputs

# Load and preprocess the dataset
dataset = load_dataset('cnn_dailymail', '3.0.0')
tokenized_dataset = dataset.map(preprocess_function, batched=True)


train_dataset = tokenized_dataset['train'].select(range(200))
val_dataset = tokenized_dataset['validation'].select(range(20))

# Load the BART model
model = BartForConditionalGeneration.from_pretrained('facebook/bart-base')

# Initialize the data collator
data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model)

# Training arguments
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=1,
    per_device_train_batch_size=8,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir='./logs',
    save_strategy='no',
    logging_steps=10,
)

# Initialize the Trainer with reduced dataset
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    data_collator=data_collator
)

# Start the fine-tuning process
trainer.train()

# Save the fine-tuned model and tokenizer
model.save_pretrained('./fine_tuned_bart')
tokenizer.save_pretrained('./fine_tuned_bart')
