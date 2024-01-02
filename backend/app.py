import os
import uuid
import requests
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from langchain.document_loaders import PyPDFLoader, CSVLoader
from langchain.chains.summarize import load_summarize_chain
from langchain.chat_models import ChatOpenAI
from typing import Dict, List

app = FastAPI()
task_status: Dict[str, str] = {}  # Dictionary to store task status

# Set your OpenAI API key
os.environ['OPENAI_API_KEY'] = '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'

def file_type(url):
    if url.lower().endswith('.pdf'):
        return 'pdf'
    elif url.lower().endswith('.csv'):
        return 'csv'
    else:
        raise ValueError('Unsupported file type')

def download_file(url):
    response = requests.get(url)
    if response.status_code == 200:
        file_suffix = '.pdf' if url.lower().endswith('.pdf') else '.csv'
        temp_file = NamedTemporaryFile(delete=False, suffix=file_suffix)
        temp_file.write(response.content)
        temp_file.close()
        return temp_file.name
    else:
        raise Exception(f"Failed to download file: Status code {response.status_code}")

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

def process_large_file(url: str, task_id: str):
    try:
        task_status[task_id] = "Processing"
        summary = summarize_document(url)
        task_status[task_id] = "Completed: " + summary
    except Exception as e:
        task_status[task_id] = "Failed: " + str(e)

def summarize_document(url, part_size=5000) -> str:
    file_type_result = file_type(url)
    llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-1106")
    chain = load_summarize_chain(llm, chain_type="stuff")

    if file_type_result == 'pdf':
        loader = PyPDFLoader(url, extract_images=True)
    elif file_type_result == 'csv':
        file_path = download_file(url)
        loader = CSVLoader(file_path=file_path)

    docs = loader.load()
    parts = split_into_parts(docs, part_size)
    summaries: List[str] = []

    for part in parts:
        summary = chain.run(part)
        summaries.append(summary)

    return ' '.join(summaries)

@app.post("/summarize")
async def summarize(request: Request, background_tasks: BackgroundTasks):
    try:
        request_data = await request.json()
        url = request_data.get("url")
        if not url:
            raise ValueError("URL parameter is required.")

        task_id = str(uuid.uuid4())  # Generate a unique task ID
        background_tasks.add_task(process_large_file, url, task_id)
        task_status[task_id] = "Queued"

        return {"task_id": task_id}
    except Exception as e:
        error_message = f"Error occurred: {e}"
        raise HTTPException(status_code=500, detail=error_message)

@app.get("/status/{task_id}")
def check_status(task_id: str):
    status = task_status.get(task_id, "Not Found")
    return {"task_id": task_id, "status": status}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
