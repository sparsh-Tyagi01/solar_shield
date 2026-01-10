#!/bin/bash

# SolarShield 3D - Complete System Start Script
# Starts backend API and frontend application with 3D visualization

echo "🌟 Starting SolarShield 3D System..."
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    echo -e "${GREEN}✓ Virtual environment found${NC}"
    source .venv/bin/activate
fi

# Check if models exist
if [ ! -f "models/storm_severity.h5" ]; then
    echo -e "${YELLOW}⚠️  ML models not found. Training...${NC}"
    python -m backend.ml.train_pipeline
else
    echo -e "${GREEN}✓ ML models ready${NC}"
fi

# Check if node_modules exists in frontend
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
    cd frontend
    npm install
    cd ..
else
    echo -e "${GREEN}✓ Frontend dependencies ready${NC}"
fi

echo ""
echo "🚀 Launching Services..."
echo "===================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}▶ Starting Backend API (Port 8000)...${NC}"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload > logs/backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend API running (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}✗ Backend failed to start. Check logs/backend.log${NC}"
    exit 1
fi

# Start frontend
echo -e "${GREEN}▶ Starting Frontend (Port 3000)...${NC}"
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 5

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend running (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}✗ Frontend failed to start. Check logs/frontend.log${NC}"
    kill $BACKEND_PID
    exit 1
fi

echo ""
echo "===================================="
echo -e "${GREEN}🎉 SolarShield 3D is now running!${NC}"
echo "===================================="
echo ""
echo "📡 Backend API:     http://localhost:8000"
echo "📡 API Docs:        http://localhost:8000/docs"
echo "🌐 Frontend:        http://localhost:3000"
echo "🌟 3D Solar System: http://localhost:3000/3d-view"
echo ""
echo "Features:"
echo "  ✨ Real-time solar system visualization"
echo "  🛰️  6 satellites with health monitoring"
echo "  ☀️  Dynamic sun with radiation effects"
echo "  🌍  Earth with magnetic field visualization"
echo "  🌙  Moon with realistic orbit"
echo "  📊  ML-powered predictions"
echo ""
echo "Press Ctrl+C to stop all services"
echo "===================================="

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
