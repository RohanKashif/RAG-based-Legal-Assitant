# Dckerfile for Legal Assistant App (FastAPI)
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY legal_assistant_service/ /app/legal_assistant_service/

RUN pip install --upgrade pip && pip install -r /app/legal_assistant_service/requirements.txt
# Expose FastAPI port
EXPOSE 8000

# Use uvicorn for FastAPI app
CMD ["uvicorn", "legal_assistant_service.app:app", "--host", "0.0.0.0", "--port", "8000"]
