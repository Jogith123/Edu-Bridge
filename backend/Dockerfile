# ── EduBridge Backend — Cloud Run Production Dockerfile ──────────────────────
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p /app/data
EXPOSE 8080
# Run seed.py first (it skips if data exists), then start the server
CMD ["sh", "-c", "python seed.py && uvicorn main:app --host 0.0.0.0 --port 8080 --workers 1"]

