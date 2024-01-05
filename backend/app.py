import os
import httpx
from fastapi import FastAPI, HTTPException, WebSocket
from pydantic import BaseModel
from tempfile import NamedTemporaryFile
from langchain.document_loaders import PyPDFLoader, CSVLoader
from langchain.chains.summarize import load_summarize_chain
from langchain.chat_models import ChatOpenAI
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect

from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Set OpenAI API key from environment variable
openai_api_key = os.getenv('OPENAI_API_KEY')

# Define a request model
class SummarizeRequest(BaseModel):
    url: str

def file_type(url):
    if url.lower().endswith('.pdf'):
        return 'pdf'
    elif url.lower().endswith('.csv'):
        return 'csv'
    else:
        raise ValueError('Unsupported file type')

async def download_file(url):
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            file_suffix = '.pdf' if url.lower().endswith('.pdf') else '.csv'
            temp_file = NamedTemporaryFile(delete=False, suffix=file_suffix)
            with open(temp_file.name, "wb") as file:
                file.write(response.content)
            return temp_file.name
        else:
            raise HTTPException(status_code=500, detail=f"Failed to download file: Status code {response.status_code}")

def split_into_parts(docs, part_size):
    parts = []
    current_part = []
    current_size = 0

    for doc in docs:
        doc_size = len(doc.page_content)
        if current_size + doc_size > part_size:
            parts.append(current_part)
            current_part = []
            current_size = 0
        current_part.append(doc)
        current_size += doc_size

    if current_part:
        parts.append(current_part)

    return parts

async def summarize_document(url, part_size=5000):
    file_type_result = file_type(url)
    llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-1106")
    chain = load_summarize_chain(llm, chain_type="stuff")

    if file_type_result == 'pdf':
        # loader = PyPDFLoader(url, extract_images=True)
        loader = PyPDFLoader(url)
    elif file_type_result == 'csv':
        file_path = await download_file(url)
        loader = CSVLoader(file_path=file_path)

    docs = loader.load()
    parts = split_into_parts(docs, part_size)
    summaries = []

    for part in parts:
        summary = chain.run(part)
        summaries.append(summary)

    return ' '.join(summaries)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            try:
                data = await websocket.receive_json()
                url = data.get("url")
                if url:
                    summary_result = await summarize_document(url)
                    await websocket.send_json({"summary": summary_result})
                else:
                    await websocket.send_json({"error": "No URL provided"})
            except WebSocketDisconnect:
                break  # Break the loop if client disconnects
            except Exception as e:
                await websocket.send_json({"error": str(e)})
                break  # Optionally, break on other exceptions
    finally:
        await websocket.close()

@app.post("/summarize")
async def summarize(request: SummarizeRequest):
    try:
        summary_result = await summarize_document(request.url)
        return {"summary": summary_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
