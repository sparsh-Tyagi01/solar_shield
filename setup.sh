#!/bin/bash

# SolarGuard 3D - Setup Script
# This script sets up the complete backend environment

set -e

echo "================================================"
echo "  🌞 SolarGuard 3D - Setup Script"
echo "================================================"

# Check Python version
echo "Checking Python version..."
python3 --version

# Create virtual environment
echo ""
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo ""
echo "Creating project directories..."
mkdir -p data/raw
mkdir -p data/processed
mkdir -p models
mkdir -p logs

echo "✓ Directories created"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "================================================"
echo "  ✅ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Train models: python backend/ml/train_pipeline.py"
echo "3. Start API server: uvicorn backend.main:app --reload"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""
