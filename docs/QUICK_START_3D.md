# 🚀 SolarShield 3D - Quick Reference Card

## 📦 Installation & Setup

```bash
# Clone and setup
cd /Users/apple/Projects/SolarSheild
source .venv/bin/activate  # or create if not exists

# Install all dependencies
pip install -r requirements.txt
cd frontend && npm install && cd ..

# Train models (first time only)
python -m backend.ml.train_pipeline
```

## 🎬 Starting the System

### One Command (Recommended)
```bash
./start_3d_system.sh
```

### Manual Start
```bash
# Terminal 1: Backend
python -m uvicorn backend.main:app --reload --port 8000

# Terminal 2: Frontend  
cd frontend && npm start
```

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Dashboard | http://localhost:3000 | Main dashboard with 3D panel |
| 3D Full View | http://localhost:3000/3d-view | Immersive 3D experience |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| Backend | http://localhost:8000 | REST API endpoints |

## 🛰️ The Six Satellites

| Name | Type | Altitude | Orbit | Purpose |
|------|------|----------|-------|---------|
| GPS-A | Navigation | 20,200 km | MEO | GPS positioning |
| COMM-1 | Communication | 35,786 km | GEO | Communications relay |
| WEATHER-SAT | Weather | 35,786 km | GEO | Weather monitoring |
| ISS | Space Station | 408 km | LEO | Human spaceflight |
| GPS-B | Navigation | 20,200 km | MEO | Backup GPS |
| RESEARCH-X | Research | 500 km | LEO | Scientific missions |

## 🎨 Color Codes

### Satellite Health
- 🟢 **Green (80-100%)**: Healthy, fully operational
- 🟡 **Yellow (50-80%)**: Minor degradation
- 🟠 **Orange (20-50%)**: Significant damage
- 🔴 **Red (0-20%)**: Critical condition

### Magnetic Field
- 🔵 **Blue**: Normal conditions (positive Bz)
- 🔴 **Red**: Storm conditions (negative Bz, compressed field)

### Radiation Level
- 🟢 **Low (0-5)**: Safe conditions
- 🟡 **Moderate (5-10)**: Monitor closely
- 🟠 **High (10-15)**: Warning level
- 🔴 **Extreme (15+)**: Danger zone

## 🎮 Controls

### 3D View Interactions
- **Rotate**: Left-click + drag
- **Pan**: Right-click + drag  
- **Zoom**: Mouse scroll wheel
- **Reset**: Refresh page

### Navigation
- **Dashboard**: Main overview page
- **3D View**: Click "3D Solar System" in nav bar
- **Info Panel**: Click "Hide/Show Info" button (3D view only)

## 📊 Key Features

### Sun
- Dynamic corona pulsation
- 8 animated solar flares
- X-ray flux affects intensity
- Solar particle emission

### Earth
- Rotating globe with clouds
- 8 magnetic field lines
- Field color responds to Bz
- Atmospheric glow

### Moon
- Realistic orbit around Earth
- Proper size and distance
- Orbital inclination

### Satellites
- Individual health monitoring
- Realistic orbital mechanics
- Distance-based degradation
- Real-time labels

## 🔬 Physics Calculations

### Radiation Level
```
radiation = |Bz| + (speed - 400)/50 + density
```

### Magnetic Field Strength  
```
strength = Bz < 0 
  ? max(0.3, 1.0 + Bz/20)  # Compressed
  : 1.0 + Bz/100            # Normal
```

### Satellite Health
```
radiationFactor = 1 / (distanceFromSun²)
degradationRate = radiation × radiationFactor × 0.001
health = max(0, 100 - degradation × 0.7)
```

## 📡 API Endpoints

### Predictions
```bash
# Storm occurrence
curl -X POST http://localhost:8000/predict/storm \
  -H "Content-Type: application/json" \
  -d '{"bz": -8.5, "speed": 550, "density": 12}'

# Storm severity
curl -X POST http://localhost:8000/predict/severity \
  -H "Content-Type: application/json" \
  -d '{"bz": -8.5, "speed": 550, "density": 12}'

# Impact analysis
curl -X POST http://localhost:8000/predict/impact \
  -H "Content-Type: application/json" \
  -d '{"bz": -8.5, "speed": 550, "density": 12}'
```

### Real-Time Data
```bash
# Current conditions
curl http://localhost:8000/api/current-conditions

# WebSocket connection
ws://localhost:8000/ws
```

## 🧪 Testing

```bash
# Run demo scenarios
python demo_3d_features.py

# Test all components
python test_components.py

# Test integration
python test_integration.py
```

## 📂 Key Files

### Components
- `frontend/src/components/SolarSystemVisualization.tsx` - Main 3D scene
- `frontend/src/pages/SolarSystem3DView.tsx` - Full-screen view
- `frontend/src/pages/Dashboard.tsx` - Dashboard integration

### Backend
- `backend/main.py` - FastAPI app with WebSocket
- `backend/ml/` - ML models
- `backend/data/fetcher.py` - Data ingestion

### Documentation
- `3D_FEATURES.md` - Complete feature list
- `3D_VISUALIZATION_GUIDE.md` - Technical implementation
- `IMPLEMENTATION_COMPLETE.md` - Summary

### Scripts
- `start_3d_system.sh` - One-command startup
- `demo_3d_features.py` - Interactive demo

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Activate virtual environment
source .venv/bin/activate

# Check models exist
ls models/
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Reinstall dependencies
cd frontend && rm -rf node_modules && npm install
```

### 3D view is black
- Check browser console for WebGL errors
- Update graphics drivers
- Try a different browser (Chrome recommended)
- Check Three.js version in package.json

### Satellites not moving
- Check WebSocket connection in browser console
- Verify backend is running
- Check for JavaScript errors

## 📈 Performance Tips

- **Reduce particles**: Lower radiation = fewer particles
- **Close other tabs**: Free up GPU memory
- **Use Chrome**: Best WebGL performance
- **Update drivers**: Latest graphics drivers

## 🔮 Future Enhancements

### Easy to Add
- [ ] Click satellites for details
- [ ] Time acceleration controls
- [ ] More satellites
- [ ] Satellite trails

### Advanced
- [ ] Real Earth/Sun textures
- [ ] CME visualization
- [ ] Aurora effects
- [ ] VR support

## 💡 Tips

1. **Best view**: Start with full-screen 3D view
2. **Understanding**: Watch magnetic field color during storm
3. **Satellites**: Zoom in to see details
4. **Data**: Check info panel for live metrics
5. **Demo**: Run `demo_3d_features.py` to see different scenarios

## 📞 Quick Commands

```bash
# Start everything
./start_3d_system.sh

# Stop everything
Ctrl+C (in terminal running start script)

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Check status
curl http://localhost:8000/health  # if endpoint exists
curl http://localhost:3000          # should return HTML
```

## 🎯 Success Checklist

- ✅ Backend running on port 8000
- ✅ Frontend running on port 3000  
- ✅ Can access dashboard
- ✅ 3D view loads and shows Sun/Earth/Moon
- ✅ 6 satellites visible and moving
- ✅ Magnetic field lines visible
- ✅ Satellite labels showing health %
- ✅ Can rotate/pan/zoom view

---

**🌟 You're all set! Open http://localhost:3000/3d-view and enjoy!**
