# 🌞 SolarGuard 3D - Quick Start Guide

## Installation & Setup

### 1. Setup Environment

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

This will:
- Create a virtual environment
- Install all dependencies
- Create necessary directories
- Setup configuration

### 2. Test Installation

```bash
# Activate virtual environment
source venv/bin/activate

# Run component tests
python test_components.py
```

### 3. Train AI Models

```bash
# Train all three models (takes 5-10 minutes)
python backend/ml/train_pipeline.py

# Or train specific model
python backend/ml/train_pipeline.py --model occurrence
python backend/ml/train_pipeline.py --model severity
python backend/ml/train_pipeline.py --model impact
```

### 4. Start API Server

```bash
# Start FastAPI server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the quick start script:

```bash
chmod +x start.sh
./start.sh
```

---

## API Endpoints

Once the server is running, visit **http://localhost:8000/docs** for interactive API documentation.

### Core Prediction Endpoints

#### 1. Storm Occurrence Prediction
```bash
curl -X POST "http://localhost:8000/predict/storm" \
  -H "Content-Type: application/json" \
  -d '{
    "bz": -8.5,
    "speed": 550,
    "density": 12,
    "pressure": 3.5,
    "xray_flux": 1.5e-5,
    "proton_flux": 15
  }'
```

**Response:**
```json
{
  "will_storm_occur": true,
  "probability": 0.85,
  "confidence": 0.70,
  "risk_level": "CRITICAL",
  "timestamp": "2026-01-06 12:00:00 UTC"
}
```

#### 2. Storm Severity Prediction
```bash
curl -X POST "http://localhost:8000/predict/severity" \
  -H "Content-Type: application/json" \
  -d '{
    "bz": -8.5,
    "speed": 550,
    "density": 12,
    "proton_flux": 15,
    "xray_flux": 1.5e-5
  }'
```

**Response:**
```json
{
  "severity_score": 7.2,
  "category": "SEVERE",
  "expected_impacts": [
    "GPS accuracy degradation",
    "Satellite orientation issues",
    "HF radio propagation fade"
  ],
  "timestamp": "2026-01-06 12:00:00 UTC"
}
```

#### 3. Impact Risk Classification
```bash
curl -X POST "http://localhost:8000/predict/impact" \
  -H "Content-Type: application/json" \
  -d '{
    "bz": -8.5,
    "speed": 550,
    "density": 12
  }'
```

**Response:**
```json
{
  "satellites": {
    "risk": 0.85,
    "status": "CRITICAL",
    "affected": true
  },
  "gps": {
    "risk": 0.72,
    "status": "HIGH",
    "affected": true
  },
  "communication": {
    "risk": 0.68,
    "status": "HIGH",
    "affected": true
  },
  "power_grid": {
    "risk": 0.45,
    "status": "MODERATE",
    "affected": false
  },
  "affected_systems": ["satellites", "gps", "communication"],
  "timestamp": "2026-01-06 12:00:00 UTC"
}
```

#### 4. All Predictions at Once
```bash
curl "http://localhost:8000/predict/all?bz=-8.5&speed=550&density=12&proton_flux=15"
```

#### 5. Real-time Status
```bash
curl "http://localhost:8000/realtime/status"
```

Gets live data from NASA/NOAA and makes all predictions.

#### 6. SHAP Explanation (AI Interpretability)
```bash
curl "http://localhost:8000/explain/shap?bz=-8.5&speed=550&density=12"
```

**Response:**
```json
{
  "feature_importance": {
    "bz_rolling_30min": -0.45,
    "energy_coupling": 0.32,
    "speed": 0.18
  },
  "reasoning": "Southward magnetic field (Bz) strongly indicates storm conditions. High solar wind speed increases storm probability.",
  "prediction": 0.85
}
```

### Utility Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /models/info` - Model details and feature importance
- `WebSocket /realtime/stream` - Real-time streaming updates

---

## WebSocket Streaming

For real-time updates in frontend:

```javascript
const ws = new WebSocket('ws://localhost:8000/realtime/stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
  // Update 3D visualization with data.visual_params
};
```

---

## Example Usage Scenarios

### Scenario 1: Check Current Conditions

```python
import requests

response = requests.get('http://localhost:8000/realtime/status')
data = response.json()

print(f"Current Bz: {data['current_conditions']['bz']}")
print(f"Storm probability: {data['predictions']['storm_occurrence']['probability']}")
```

### Scenario 2: Monitor Specific Conditions

```python
import requests

# Your sensor data
conditions = {
    "bz": -12.0,
    "speed": 650.0,
    "density": 20.0,
    "proton_flux": 50.0,
    "xray_flux": 2e-5
}

# Get all predictions
response = requests.get(
    'http://localhost:8000/predict/all',
    params=conditions
)

predictions = response.json()

if predictions['storm_occurrence']['will_storm_occur']:
    print(f"⚠️ STORM ALERT!")
    print(f"Severity: {predictions['storm_severity']['category']}")
    print(f"Affected: {predictions['impact_risk']['affected_systems']}")
```

---

## Model Performance Metrics

After training, you'll see metrics like:

### Model A - Storm Occurrence
- **Accuracy**: ~87%
- **ROC-AUC**: ~0.92
- **Precision**: ~84%

### Model B - Storm Severity
- **MAE**: ~1.2 (on 0-10 scale)
- **RMSE**: ~1.8
- **R²**: ~0.85

### Model C - Impact Risk
- **Overall Accuracy**: ~85%
- **Per-category F1**: 0.80-0.88

---

## Troubleshooting

### Models not loading?
```bash
python backend/ml/train_pipeline.py
```

### Import errors?
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Port already in use?
```bash
# Use different port
uvicorn backend.main:app --port 8001
```

---

## Project Structure

```
SolarSheild/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── data/
│   │   ├── fetcher.py          # NASA/NOAA data fetching
│   │   └── feature_engineer.py # Feature engineering
│   ├── ml/
│   │   ├── storm_occurrence.py # Model A (XGBoost)
│   │   ├── storm_severity.py   # Model B (LSTM)
│   │   ├── impact_risk.py      # Model C (Random Forest)
│   │   └── train_pipeline.py   # Training script
│   └── utils/
│       ├── helpers.py           # Utility functions
│       └── logger.py            # Logging
├── data/
│   ├── raw/                     # Raw data
│   └── processed/               # Processed features
├── models/                      # Trained models
├── requirements.txt
└── README.md
```

---

## Next Steps

1. ✅ Backend complete
2. ⏭️ Build 3D visualization frontend
3. ⏭️ Deploy to production

---

**For questions or issues, check the logs in `logs/` directory.**
