#!/bin/bash
# Startup script for Render.com deployment
# Ensures proper Python path and working directory

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to project root directory
cd "$SCRIPT_DIR" || exit 1

# Set Python path to include project root
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH}"

# Get port from environment (Render provides this)
PORT="${PORT:-8000}"

echo "======================================"
echo "Starting SolarShield Backend"
echo "======================================"
echo "Working directory: $(pwd)"
echo "Python path: $PYTHONPATH"
echo "Port: $PORT"
echo "Python version: $(python --version 2>&1 || python3 --version 2>&1)"
echo "======================================"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "ERROR: backend directory not found!"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

echo "✓ Backend directory found"
echo "Starting uvicorn server..."
echo ""

# Start uvicorn server - try python3 first, then python
if command -v python3 &> /dev/null; then
    exec python3 -m uvicorn backend.main:app --host 0.0.0.0 --port "$PORT"
elif command -v python &> /dev/null; then
    exec python -m uvicorn backend.main:app --host 0.0.0.0 --port "$PORT"
else
    echo "ERROR: Python not found!"
    exit 1
fi
