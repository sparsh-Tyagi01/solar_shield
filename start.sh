#!/bin/bash

# Quick Start Script - Train models and start server

set -e

echo "================================================"
echo "  🚀 SolarGuard 3D - Quick Start"
echo "================================================"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Run ./setup.sh first"
    exit 1
fi

# Train models
echo ""
echo "Step 1: Training AI models..."
echo "This may take several minutes..."
python backend/ml/train_pipeline.py --days 365

echo ""
echo "Step 2: Starting API server..."
echo ""
echo "API Server starting at http://localhost:8000"
echo "API Documentation at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
