#!/bin/bash
# Startup script for Render.com deployment
# Ensures proper Python path and working directory

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to project root directory
cd "$SCRIPT_DIR"

# Set Python path to include project root
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH}"

# Get port from environment (Render provides this)
PORT="${PORT:-8000}"

echo "Starting SolarShield backend..."
echo "Working directory: $(pwd)"
echo "Python path: $PYTHONPATH"
echo "Port: $PORT"

# Start uvicorn server
python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
