# 🌞 SolarGuard 3D

**AI-Powered 3D Space Weather Intelligence Platform with Realistic Solar System Visualization**

SolarGuard 3D predicts geomagnetic storm severity and visually simulates real-time Sun → Earth space-weather interactions in a scientifically accurate 3D environment featuring the Sun, Earth, Moon, and 6 tracked satellites.

## 🎯 Problem Statement

Modern society relies heavily on satellites, GPS navigation, aviation communication, and power grids. Solar flares & geomagnetic storms can damage satellites, degrade GPS accuracy, disrupt communication systems, and cause power outages.

Existing systems:
- ❌ Are 2D charts that are hard to interpret
- ❌ Provide alerts but no intuitive visualization
- ❌ Do not show cause → effect chain
- ❌ Lack real-time satellite health monitoring

## ✨ Our Solution

**AI-powered platform** that predicts geomagnetic storm severity and visually simulates real-time Sun → Earth space-weather interactions in a scientifically accurate 3D environment.

### 🌟 New 3D Solar System Visualization

**Realistic, data-driven 3D visualization featuring:**
- ☀️ **Dynamic Sun** with solar flares and radiation effects
- 🌍 **Earth** with magnetic field visualization that responds to solar activity
- 🌙 **Moon** with realistic orbital mechanics
- 🛰️ **6 Satellites** (GPS, Communication, Weather, ISS, Research) with:
  - Real-time health monitoring
  - Radiation degradation based on distance and solar activity
  - Individual orbital paths and characteristics
  - Color-coded health status (green → yellow → orange → red)

**All visualizations are based on real ML model predictions:**
- Solar radiation intensity from X-ray and proton flux
- Magnetic field strength from Bz component
- Satellite degradation from radiation exposure
- Particle streams showing solar wind

📖 **[View Complete 3D Features Documentation](3D_FEATURES.md)**

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

### Option 1: One-Command Start (Recommended)

```bash
# Start both backend and frontend with 3D visualization
./start_3d_system.sh
```

Then visit:
- **Main Dashboard**: http://localhost:3000
- **3D Solar System**: http://localhost:3000/3d-view
- **API Docs**: http://localhost:8000/docs

### Option 2: Manual Setup

#### 1. Installation

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

#### 2. Train Models

```bash
# Fetch historical data and train all models
python -m backend.ml.train_pipeline
```

#### 3. Start Backend

```bash
# Terminal 1: Start FastAPI server
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### 4. Start Frontend

```bash
# Terminal 2: Start React app
cd frontend
npm start
```

### 5. API Documentation

Visit: http://localhost:8000/docs

## 📡 API Endpoints

- `POST /predict/storm` - Predict storm occurrence
- `POST /predict/severity` - Predict storm severity  
- `POST /predict/impact` - Classify impact zones
- `GET /explain/shap` - Get SHAP explanations
- `GET /api/current-conditions` - Get current space weather
- `WebSocket /ws` - Real-time data stream for 3D visualization

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
Real-Time Data Stream (WebSocket)
        ↓
3D Visualization Engine (Three.js)
        ↓
React Dashboard + Full-Screen 3D View
```

### 3D Visualization Pipeline

```
ML Model Predictions → Backend API → WebSocket
                                        ↓
                              Frontend State Management
                                        ↓
        ┌───────────────────────────────┴──────────────────────────┐
        ↓                               ↓                           ↓
   Sun Radiation              Earth Magnetic Field          Satellite Health
   (X-ray flux)                   (Bz component)          (Distance + Radiation)
        ↓                               ↓                           ↓
   Visual Effects             Field Line Colors              Color Coding
   (Flares, Particles)        (Blue/Red transition)         (Green → Red)
```

## 📁 Project Structure

```
SolarSheild/
├── backend/
│   ├── main.py                 # FastAPI app with WebSocket
│   ├── config.py               # Configuration
│   ├── data/
│   │   ├── fetcher.py          # Data ingestion
│   │   └── feature_engineer.py # Feature engineering
│   ├── ml/
│   │   ├── storm_occurrence.py # Model A (Random Forest)
│   │   ├── storm_severity.py   # Model B (LSTM)
│   │   ├── impact_risk.py      # Model C (Random Forest)
│   │   └── train_pipeline.py   # Training script
│   └── utils/
│       ├── helpers.py
│       └── logger.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SolarSystemVisualization.tsx  # 🌟 3D Solar System
│   │   │   ├── Navigation.tsx
│   │   │   ├── RealTimeMetrics.tsx
│   │   │   ├── SatelliteMonitor.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SolarSystem3DView.tsx  # 🌟 Full-screen 3D
│   │   │   ├── StormPrediction.tsx
│   │   │   └── ...
│   │   └── context/
│   │       └── WebSocketContext.tsx
│   └── package.json
├── data/
│   ├── raw/                    # Raw space weather data
│   └── processed/              # Engineered features
├── models/                     # Trained ML models (.pkl, .h5)
├── logs/                       # Application logs
├── start_3d_system.sh         # 🌟 One-command startup script
├── 3D_FEATURES.md             # 🌟 Complete 3D features documentation
├── 3D_VISUALIZATION_GUIDE.md  # 🌟 Technical implementation guide
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
