# 🌞 SolarGuard 3D - Frontend & Backend Integration

## Overview
SolarGuard 3D is an AI-powered space weather intelligence platform with real-time geomagnetic storm prediction and 3D visualization.

## Quick Start

### Start Both Servers
```bash
./start_all.sh
```

### Manual Start

**Backend:**
```bash
source .venv/bin/activate
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm start
```

## Access Points

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Current Conditions
```bash
curl http://localhost:8000/api/current-conditions
```

### Storm Prediction
```bash
curl http://localhost:8000/api/predict/storm
```

### Impact Analysis
```bash
curl http://localhost:8000/api/predict/impact
```

### Historical Data
```bash
curl http://localhost:8000/api/historical/24h
curl http://localhost:8000/api/historical/7d
curl http://localhost:8000/api/historical/30d
```

### WebSocket Stream
```javascript
const socket = io('http://localhost:8000');
socket.on('update', (data) => {
  console.log('Real-time update:', data);
});
```

## Frontend Features

1. **Dashboard** (`/`)
   - 3D Earth magnetosphere visualization
   - Real-time metrics (Bz, speed, density, Kp index)
   - Storm alerts with severity levels
   - Solar wind parameter charts

2. **Storm Prediction** (`/prediction`)
   - AI-powered storm probability
   - Severity scoring (0-10 scale)
   - Alert level indicators
   - Confidence metrics

3. **Impact Analysis** (`/impact`)
   - Risk distribution radar chart
   - System-specific impact assessment
   - Satellites, GPS, Communication, Power Grid

4. **Historical Data** (`/history`)
   - Time-series visualizations
   - 24h, 7d, 30d views
   - Interactive charts

## Architecture

### Backend (FastAPI + Python)
- **Storm Occurrence Model**: XGBoost Binary Classifier
- **Storm Severity Model**: LSTM Time-Series Predictor
- **Impact Risk Model**: Random Forest Multi-Label Classifier
- Real-time data fetching from NASA/NOAA
- WebSocket streaming for live updates

### Frontend (React + TypeScript)
- **3D Visualization**: Three.js via React Three Fiber
- **Charts**: Recharts for time-series data
- **UI**: Tailwind CSS with glassmorphism effects
- **Animations**: Framer Motion
- **Real-time**: Socket.io client

## Testing

Run integration tests:
```bash
python test_integration.py
```

## Stop Servers

```bash
pkill -f 'uvicorn backend.main'
pkill -f 'react-scripts start'
```

## Logs

View logs:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

## Development

### Backend Development
```bash
source .venv/bin/activate
uvicorn backend.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm start
```

## Configuration

Backend config: `backend/config.py`
- API host/port
- Data sources (NASA, NOAA)
- Model paths
- Update intervals

## Models Status

Check loaded models:
```bash
curl http://localhost:8000/health
```

Train models if needed:
```bash
python -m backend.ml.train_pipeline
```

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

**Backend not fetching real data:**
- Check internet connection
- Verify NASA/NOAA URLs in config
- Backend will use mock data if external sources fail

**Frontend build errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Tech Stack

**Backend:**
- FastAPI, Uvicorn
- TensorFlow/Keras, XGBoost, scikit-learn
- Pandas, NumPy
- SHAP for explainability

**Frontend:**
- React 18, TypeScript
- Three.js, React Three Fiber, Drei
- Recharts, Tailwind CSS
- Socket.io, Axios
- Framer Motion

## License

MIT License - See LICENSE file for details
