# 🌞 SolarShield - AI-Powered Space Weather Intelligence Platform

Real-time solar storm monitoring and prediction system with 3D visualization, satellite tracking, and ML-powered risk assessment.

![Status](https://img.shields.io/badge/status-active-success)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![React](https://img.shields.io/badge/react-18+-61dafb)

## 🚀 Features

- **Real-time Solar Data Monitoring** - Live NOAA & NASA data feeds
- **AI Storm Prediction** - XGBoost & LSTM models for occurrence and severity
- **3D Solar System Visualization** - Interactive Earth, Sun, satellites
- **Satellite Fleet Monitoring** - Track 6+ satellites with health metrics
- **Impact Risk Analysis** - Assess threats to infrastructure and operations
- **WebSocket Real-time Updates** - Live data streaming to frontend
- **Historical Analysis** - Analyze past solar events and patterns

## 📁 Project Structure

```
SolarSheild/
├── backend/              # FastAPI backend API
│   ├── data/            # Data fetching & processing
│   ├── ml/              # ML models (XGBoost, LSTM)
│   └── utils/           # Logging & helpers
├── frontend/            # React + TypeScript UI
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Application pages
│       └── context/     # WebSocket & state management
├── data/                # Training & processed data
├── models/              # Trained ML model files
├── docs/                # Documentation
├── tests/               # Test suites
└── scripts/             # Setup & training scripts
```

## 🛠️ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Local Development

**1. Backend Setup:**
```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn backend.main:app --reload
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

**2. Frontend Setup:**
```bash
cd frontend
npm install
npm start
```

Frontend runs at: http://localhost:3000

## 🐳 Docker Deployment

**Quick start with Docker Compose:**
```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

**Individual containers:**
```bash
# Backend
docker build -f backend/Dockerfile -t solarsheild-backend .
docker run -p 8000:8000 solarsheild-backend

# Frontend
cd frontend
docker build -t solarsheild-frontend .
docker run -p 80:80 solarsheild-frontend
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Backend README](backend/README.md) - Backend API documentation
- [Frontend README](frontend/README.md) - Frontend development guide
- [Full Documentation](docs/) - Complete technical documentation

## 🧪 Testing

```bash
# Run all tests
python tests/test_integration.py

# Test ML models
python tests/test_impact_model.py

# Test components
python tests/test_components.py
```

## 🔧 Configuration

### Backend Environment Variables
Create `.env` in project root:
```env
LOG_LEVEL=INFO
PYTHONUNBUFFERED=1
```

### Frontend Environment Variables
Create `.env` in frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

## 📊 Data Sources

- **NOAA SWPC** - Real-time solar wind and magnetic field data
- **NASA** - Solar flare and CME data
- **TLE Data** - Satellite orbital elements for tracking

## 🤖 ML Models

### Storm Occurrence Predictor (XGBoost)
- Binary classification: Will a storm occur?
- Features: Solar wind speed, Bz, density, pressure
- Output: Probability + Yes/No prediction

### Storm Severity Predictor (LSTM)
- Multi-class classification: G1-G5 severity scale
- Time-series analysis of solar wind parameters
- Output: Severity level with confidence

### Impact Risk Model
- Infrastructure risk assessment
- Satellite vulnerability analysis
- Regional impact predictions

## 🛰️ Satellite Tracking

Monitors 6 satellites:
- GPS (NAVSTAR)
- Communication (GOES)
- Weather (NOAA)
- ISS
- Research satellites (x2)

Real-time metrics:
- Orbital position & velocity
- Radiation exposure
- System health status
- Predicted degradation

## 🌐 API Endpoints

Key endpoints:
- `GET /api/realtime` - Current solar conditions
- `GET /api/prediction` - Storm predictions
- `GET /api/satellites` - Satellite status
- `GET /api/impact` - Impact risk analysis
- `WS /ws/stream` - Real-time data stream

Full API documentation: http://localhost:8000/docs

## 🎨 Frontend Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D visualization
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **WebSocket** - Real-time updates

## 🏗️ Backend Stack

- **FastAPI** - Modern Python web framework
- **scikit-learn** - ML model training
- **TensorFlow/Keras** - LSTM neural networks
- **pandas** - Data processing
- **requests** - API data fetching

## 📈 Performance

- Real-time data updates every 5 seconds
- WebSocket latency < 100ms
- ML inference < 50ms
- 3D rendering at 60fps

## 🔒 Security

- CORS configuration for API access
- Input validation on all endpoints
- Rate limiting on data endpoints
- Secure WebSocket connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

AI-powered space weather monitoring system built with modern web technologies.

## 📞 Support

For issues and questions:
- Check [Documentation](docs/)
- Review [Issues](issues/)
- See [Deployment Guide](DEPLOYMENT.md)

## 🔄 Updates

- ✅ Real-time data streaming
- ✅ ML prediction models
- ✅ 3D visualization
- ✅ Satellite tracking
- ✅ Docker deployment
- 🚧 Mobile app (coming soon)
- 🚧 Advanced alerting system
- 🚧 Historical data analysis tools

---

Built with ❤️ using Python, React, and AI
