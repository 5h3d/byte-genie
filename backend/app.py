from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import BartForConditionalGeneration, BartTokenizer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

app = FastAPI()

# Retrieve CORS origin from environment variable
cors_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load tokenizer and model for BART
tokenizer = BartTokenizer.from_pretrained("./fine_tuned_bart")
model = BartForConditionalGeneration.from_pretrained("./fine_tuned_bart")

# Define request model
class SummarizeRequest(BaseModel):
    text: str

@app.post("/summarize/")
async def summarize_document(request: SummarizeRequest):
    max_token_count = 1024

    try:
        # Encode the input text and convert to a tensor
        input_ids = tokenizer.encode(request.text, return_tensors='pt', add_special_tokens=True, truncation=True, max_length=max_token_count)
        
        # Check if input was truncated
        was_truncated = input_ids.size(1) == max_token_count

        # Generate the summary
        summary_ids = model.generate(
            input_ids, 
            max_length=130, 
            min_length=30, 
            length_penalty=2.0, 
            num_beams=4, 
            early_stopping=True
        )
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        summary_data = {
            "summary": summary,
            "was_truncated": was_truncated
        }

        return JSONResponse(content=summary_data)

    except Exception as e:
        print(f"Error during summarization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
