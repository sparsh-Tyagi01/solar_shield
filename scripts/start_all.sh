#!/bin/bash

# SolarGuard 3D - Start Script
# Starts both backend and frontend servers

echo "================================================"
echo "Starting SolarGuard 3D"
echo "================================================"
echo ""

# Check if backend is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend already running on port 8000"
else
    echo "🚀 Starting backend server..."
    cd "$(dirname "$0")"
    source .venv/bin/activate
    python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   Backend PID: $BACKEND_PID"
    sleep 3
fi

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Frontend already running on port 3000"
else
    echo "🚀 Starting frontend server..."
    cd frontend
    npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   Frontend PID: $FRONTEND_PID"
    cd ..
fi

echo ""
echo "================================================"
echo "✅ SolarGuard 3D is starting..."
echo "================================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  Backend:  tail -f logs/backend.log"
echo "  Frontend: tail -f logs/frontend.log"
echo ""
echo "To stop servers:"
echo "  pkill -f 'uvicorn backend.main'"
echo "  pkill -f 'react-scripts start'"
echo "================================================"
