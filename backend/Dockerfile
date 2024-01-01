FROM python:3.9

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000

ENV MODEL_DIR /app/fine_tuned_bart

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
