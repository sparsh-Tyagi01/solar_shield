# 🌞 SolarGuard 3D - System Architecture Diagram

## Complete Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SPACE WEATHER DATA SOURCES                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐              ┌────────────────┐               │
│  │   NASA OMNI     │              │   NOAA GOES    │               │
│  │                 │              │                │               │
│  │  • IMF Bz       │              │  • X-ray flux  │               │
│  │  • Speed        │              │  • Proton flux │               │
│  │  • Density      │              │                │               │
│  │  • SYM-H        │              │                │               │
│  └────────┬────────┘              └────────┬───────┘               │
│           │                                │                        │
└───────────┼────────────────────────────────┼────────────────────────┘
            │                                │
            └────────────┬───────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     DATA INGESTION LAYER                             │
│                   (backend/data/fetcher.py)                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  SpaceWeatherDataFetcher                                   │    │
│  │                                                            │    │
│  │  • fetch_omni_data()        → Solar wind parameters       │    │
│  │  • fetch_goes_data()        → X-ray & proton flux         │    │
│  │  • fetch_realtime_data()    → Latest measurements         │    │
│  │  • fetch_training_data()    → Historical data (365 days)  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   FEATURE ENGINEERING LAYER                          │
│              (backend/data/feature_engineer.py)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Physics-Based Feature Engineering                         │    │
│  │                                                            │    │
│  │  ROLLING FEATURES (Energy Buildup):                       │    │
│  │  • bz_rolling_30min, bz_rolling_60min                     │    │
│  │  • speed_rolling_mean, speed_rolling_max                  │    │
│  │  • proton_cumulative                                      │    │
│  │                                                            │    │
│  │  GRADIENT FEATURES (Shock Detection):                     │    │
│  │  • bz_gradient (ΔBz/Δt)                                   │    │
│  │  • pressure_spike                                         │    │
│  │  • proton_gradient                                        │    │
│  │                                                            │    │
│  │  INTERACTION FEATURES:                                     │    │
│  │  • energy_coupling = v * Bz² * sin⁴(θ/2)                 │    │
│  │  • ram_pressure = 1.67×10⁻⁶ * n * v²                     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       AI/ML MODEL LAYER                              │
│                      (backend/ml/*.py)                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  MODEL A: Storm Occurrence Predictor                       │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  Algorithm: XGBoost (Binary Classifier)         │      │    │
│  │  │  Question: Will storm occur in 12-24 hrs?       │      │    │
│  │  │  Input: 6 features (Bz, speed, gradients...)    │      │    │
│  │  │  Output: Yes/No + Probability                   │      │    │
│  │  │  Accuracy: ~87%                                 │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  MODEL B: Storm Severity Predictor                         │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  Algorithm: LSTM (Time-Series Regression)       │      │    │
│  │  │  Question: How severe? (0-10 scale)             │      │    │
│  │  │  Input: 60-min sequences × 6 features           │      │    │
│  │  │  Architecture: 64→32 LSTM units                 │      │    │
│  │  │  Output: Severity score + Category              │      │    │
│  │  │  MAE: ~1.2                                      │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  MODEL C: Impact Risk Classifier                           │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  Algorithm: Random Forest (Multi-Label)         │      │    │
│  │  │  Question: Which systems affected?              │      │    │
│  │  │  Categories: 🛰️ Satellites, 📡 GPS,             │      │    │
│  │  │              📻 Communication, ⚡ Power Grid      │      │    │
│  │  │  Output: Risk probability per system            │      │    │
│  │  │  Accuracy: ~85%                                 │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      API / BACKEND LAYER                             │
│                     (backend/main.py)                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  FastAPI Endpoints                                         │    │
│  │                                                            │    │
│  │  POST /predict/storm        → Model A prediction          │    │
│  │  POST /predict/severity     → Model B prediction          │    │
│  │  POST /predict/impact       → Model C prediction          │    │
│  │  GET  /predict/all          → All predictions             │    │
│  │  GET  /realtime/status      → Live data + predictions     │    │
│  │  GET  /explain/shap         → AI explainability           │    │
│  │  WS   /realtime/stream      → WebSocket streaming         │    │
│  │  GET  /health               → System health               │    │
│  │  GET  /models/info          → Model details               │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    FRONTEND / VISUALIZATION                          │
│                  (3D React Three Fiber)                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  3D Solar System Visualization                             │    │
│  │                                                            │    │
│  │  ☀️  SUN                                                    │    │
│  │     • Dynamic glow based on X-ray flux                    │    │
│  │     • Solar flare particle effects                        │    │
│  │                                                            │    │
│  │  🌊 CME (Coronal Mass Ejection)                           │    │
│  │     • Particle streams from Sun to Earth                  │    │
│  │     • Speed based on solar wind velocity                  │    │
│  │                                                            │    │
│  │  🌍 EARTH                                                   │    │
│  │     • Magnetosphere visualization                         │    │
│  │     • Compression based on Bz                             │    │
│  │     • Aurora effects during storms                        │    │
│  │                                                            │    │
│  │  🛰️ SATELLITES                                             │    │
│  │     • Risk indicators                                     │    │
│  │     • Clickable for details                               │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Prediction Dashboard                                      │    │
│  │                                                            │    │
│  │  • Storm occurrence probability gauge                     │    │
│  │  • Severity meter (0-10)                                  │    │
│  │  • Impact system cards                                    │    │
│  │  • SHAP explanation panel                                 │    │
│  │  • Real-time data feed                                    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                        KEY TECHNOLOGIES

┌─────────────────────┬──────────────────────────────────────────────┐
│     Component       │              Technology Stack                │
├─────────────────────┼──────────────────────────────────────────────┤
│ Data Fetching       │ Python, Requests, aiohttp                   │
│ Feature Engineering │ Pandas, NumPy                               │
│ Model A             │ XGBoost, scikit-learn                       │
│ Model B             │ TensorFlow/Keras, LSTM                      │
│ Model C             │ scikit-learn, Random Forest                 │
│ Explainability      │ SHAP                                        │
│ API Backend         │ FastAPI, Uvicorn, Pydantic                  │
│ Real-time Streaming │ WebSockets                                  │
│ Logging             │ Loguru                                      │
│ Frontend (planned)  │ React, Three.js, React Three Fiber          │
└─────────────────────┴──────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

                        DATA FLOW EXAMPLE

1. 🌞 Solar flare detected on Sun
   ↓
2. 📡 NOAA GOES satellite measures X-ray spike (1.5×10⁻⁵ W/m²)
   ↓
3. 🌊 CME launches → solar wind speed increases to 650 km/s
   ↓
4. 🧲 IMF Bz turns southward (-12 nT)
   ↓
5. 📊 Data Fetcher retrieves measurements
   ↓
6. ⚙️ Feature Engineer calculates:
   - Energy coupling: 5,070
   - Ram pressure: 7.8 nPa
   - Bz gradient: -2.4 nT/min
   ↓
7. 🤖 AI Models predict:
   - Storm occurrence: 87% (CRITICAL)
   - Severity: 7.2/10 (SEVERE)
   - Impacts: Satellites ✓, GPS ✓, Comm ✓
   ↓
8. 🚀 API returns predictions via WebSocket
   ↓
9. 🎨 Frontend visualizes:
   - Sun glows brighter
   - CME particle stream travels
   - Earth's magnetosphere compresses
   - Red aurora forms at poles
   ↓
10. 👨‍💻 User sees real-time 3D physics simulation
    + receives actionable alerts

═══════════════════════════════════════════════════════════════════════

                    DEPLOYMENT ARCHITECTURE

┌────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION SETUP                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌─────────────┐         ┌──────────────┐      ┌─────────────┐  │
│   │   Nginx     │────────▶│   FastAPI    │─────▶│   Models    │  │
│   │ (Reverse    │         │   Backend    │      │   (.pkl,    │  │
│   │  Proxy)     │         │   (Uvicorn)  │      │    .h5)     │  │
│   └─────────────┘         └──────────────┘      └─────────────┘  │
│         │                                                          │
│         │                                                          │
│         ▼                                                          │
│   ┌─────────────┐                                                 │
│   │   React     │                                                 │
│   │   Frontend  │                                                 │
│   │  (Three.js) │                                                 │
│   └─────────────┘                                                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
```

## Training Pipeline Flow

```
START
  │
  ├─→ Fetch 365 days of historical data
  │    • NASA OMNI: Solar wind parameters
  │    • NOAA GOES: X-ray & proton flux
  │
  ├─→ Engineer Features
  │    • Create 20+ physics-based features
  │    • Calculate rolling averages
  │    • Detect shocks and gradients
  │    • Label storms (SYM-H < -50 nT)
  │
  ├─→ Train Model A (Storm Occurrence)
  │    • Split data 80/20
  │    • Train XGBoost classifier
  │    • Evaluate: Accuracy, ROC-AUC
  │    • Save model → models/storm_occurrence.pkl
  │
  ├─→ Train Model B (Storm Severity)
  │    • Create 60-min sequences
  │    • Train LSTM network
  │    • Evaluate: MAE, RMSE
  │    • Save model → models/storm_severity.h5
  │
  ├─→ Train Model C (Impact Risk)
  │    • Multi-label targets
  │    • Train Random Forest
  │    • Evaluate per-category metrics
  │    • Save model → models/impact_risk.pkl
  │
  └─→ COMPLETE
       • All models trained and saved
       • Ready for API deployment
       • Performance metrics logged
```

## Real-time Prediction Flow

```
User/Frontend Request
        │
        ▼
┌───────────────────┐
│  POST /predict/*  │
└────────┬──────────┘
         │
         ├─→ Validate input data
         │    (Pydantic models)
         │
         ├─→ Calculate derived features
         │    • Energy coupling
         │    • Rolling values
         │
         ├─→ Load trained models
         │    (if not already in memory)
         │
         ├─→ Run inference
         │    • Model A: XGBoost prediction
         │    • Model B: LSTM prediction
         │    • Model C: Random Forest prediction
         │
         ├─→ Post-process results
         │    • Calculate risk levels
         │    • Categorize severity
         │    • Format response
         │
         └─→ Return JSON response
              {
                "will_storm_occur": true,
                "probability": 0.87,
                "severity_score": 7.2,
                "affected_systems": [...]
              }
```

---

**Created for NASA Space Apps Challenge 2026** 🚀
**SolarGuard 3D - Protecting Earth from Space Weather** 🌞🌍
