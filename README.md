# 🌞 SolarGuard 3D

**AI-Powered 3D Space Weather Intelligence Platform**

SolarGuard 3D predicts geomagnetic storm severity and visually simulates real-time Sun → Earth space-weather interactions in a scientifically accurate 3D environment.

## 🎯 Problem Statement

Modern society relies heavily on satellites, GPS navigation, aviation communication, and power grids. Solar flares & geomagnetic storms can damage satellites, degrade GPS accuracy, disrupt communication systems, and cause power outages.

Existing systems:
- ❌ Are 2D charts that are hard to interpret
- ❌ Provide alerts but no intuitive visualization
- ❌ Do not show cause → effect chain

## ✨ Our Solution

**AI-powered platform** that predicts geomagnetic storm severity and visually simulates real-time Sun → Earth space-weather interactions in a scientifically accurate 3D environment.

## 🧠 AI Models

### Model A: Storm Occurrence Predictor
- **Question**: Will a geomagnetic storm occur in next 12–24 hrs?
- **Algorithm**: XGBoost
- **Output**: Binary (Yes/No) + Probability

### Model B: Storm Severity Predictor
- **Question**: How severe will the storm be?
- **Algorithm**: LSTM (Long Short-Term Memory)
- **Output**: Severity score (0–10)

### Model C: Impact Risk Classifier
- **Question**: What systems will be affected?
- **Algorithm**: Random Forest
- **Output**: Multi-label (Satellites, GPS, Communication, Power Grid)

## 📊 Data Sources

- **NASA OMNI**: IMF Bz, Solar wind speed, Proton density, SYM-H
- **NOAA GOES**: Proton flux, X-ray flux
- **Resolution**: 1-minute

## 🚀 Quick Start

### 1. Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup

```bash
# Copy environment file
cp .env.example .env

# Create necessary directories
mkdir -p data/raw data/processed models logs
```

### 3. Train Models

```bash
# Fetch historical data and train all models
python backend/ml/train_pipeline.py
```

### 4. Run Backend

```bash
# Start FastAPI server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. API Documentation

Visit: http://localhost:8000/docs

## 📡 API Endpoints

- `POST /predict/storm` - Predict storm occurrence
- `POST /predict/severity` - Predict storm severity
- `POST /predict/impact` - Classify impact zones
- `GET /explain/shap` - Get SHAP explanations
- `GET /realtime/status` - Get current space weather status
- `WebSocket /realtime/stream` - Real-time data stream

## 🏗️ Architecture

```
NASA OMNI + NOAA GOES
        ↓
Data Ingestion & Cleaning
        ↓
Feature Engineering
        ↓
AI Models (3 models)
        ↓
Prediction API (FastAPI)
        ↓
3D Visualization Engine
        ↓
Web Dashboard
```

## 📁 Project Structure

```
SolarSheild/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── data/
│   │   ├── fetcher.py          # Data ingestion
│   │   └── feature_engineer.py # Feature engineering
│   ├── ml/
│   │   ├── storm_occurrence.py # Model A
│   │   ├── storm_severity.py   # Model B
│   │   ├── impact_risk.py      # Model C
│   │   └── train_pipeline.py   # Training script
│   └── utils/
│       ├── helpers.py
│       └── logger.py
├── data/
│   ├── raw/                    # Raw data
│   └── processed/              # Processed data
├── models/                     # Trained models
├── logs/                       # Application logs
└── requirements.txt
```

## 🎮 Technology Stack

- **Backend**: Python, FastAPI
- **ML**: XGBoost, TensorFlow, PyTorch, SHAP
- **Data**: Pandas, NumPy
- **Real-time**: WebSockets

## 🔬 Feature Engineering

### Rolling Features (Energy Buildup)
- Bz rolling mean (30 min, 60 min)
- Solar wind pressure trend
- Proton flux accumulation

### Gradient Features (Shock Detection)
- ΔBz / Δt
- ΔProtonFlux / Δt
- Pressure spikes

## 🎯 Success Metrics

- **Prediction Accuracy**: >85% for storm occurrence
- **RMSE for Severity**: <1.5 points (0-10 scale)
- **API Response Time**: <200ms

## 📄 License

MIT License

## 🤝 Contributors

Built for NASA Space Apps Challenge 2026
