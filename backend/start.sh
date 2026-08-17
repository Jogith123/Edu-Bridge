#!/bin/bash
# Production startup script for Render

echo "[INFO] Starting EduBridge Backend..."

# Run database seeding (idempotent - won't duplicate data)
echo "[INFO] Running database migrations and seeding..."
python seed.py

# Check if seeding was successful
if [ $? -eq 0 ]; then
    echo "[OK] Database ready"
else
    echo "[ERROR] Database seeding failed"
    exit 1
fi

# Start the application
echo "[INFO] Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
