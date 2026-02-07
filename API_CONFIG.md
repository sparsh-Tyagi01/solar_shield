# API Configuration Guide

## Overview
API endpoints are now centralized and configurable via environment variables in both backend and frontend.

## Backend Configuration

### Environment Variables (.env)
Located at: `backend/.env`

```bash
# Backend API Configuration
API_HOST=0.0.0.0              # Host to bind the API server
API_PORT=8000                 # Port for the API server
API_DEBUG=True                # Enable debug mode

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Data Sources
NASA_OMNI_URL=https://omniweb.gsfc.nasa.gov/cgi/nx1.cgi
NOAA_GOES_URL=https://services.swpc.noaa.gov/json/goes

# API Keys
N2YO_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Training Configuration
TRAIN_TEST_SPLIT=0.8
RANDOM_SEED=42

# Real-time Configuration
UPDATE_INTERVAL=60
```

### Starting the Backend
```bash
cd backend
source ../.venv/bin/activate
python -m backend.main
# Or for development with auto-reload:
# uvicorn backend.main:app --reload
```

**Note**: The app automatically uses the `PORT` environment variable for cloud deployments (Render, Heroku) or falls back to `API_PORT` for local development.

## Frontend Configuration

### Environment Variables (.env)
Located at: `frontend/.env`

```bash
# Backend API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000

# Build Configuration
GENERATE_SOURCEMAP=false
```

### API Configuration File
Located at: `frontend/src/config/api.ts`

All API endpoints are centralized in this file:
```typescript
import { API } from '../config/api';

// Usage examples:
axios.get(API.currentConditions)
axios.get(API.predictStorm)
axios.get(API.historical('24h'))
```

### Starting the Frontend
```bash
cd frontend
npm start
```

## Production Deployment

### Backend (Production)
Update `backend/.env`:
```bash
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=False
FRONTEND_URL=https://your-production-domain.com
```

### Frontend (Production)
Update `frontend/.env`:
```bash
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_WS_URL=wss://your-api-domain.com
```

Then build:
```bash
cd frontend
npm run build
```

## Docker Deployment

Environment variables can be passed via docker-compose.yml or Dockerfile ENV directives.

### Example docker-compose.yml
```yaml
services:
  backend:
    environment:
      - API_HOST=0.0.0.0
      - API_PORT=8000
      - FRONTEND_URL=http://frontend:3000
      
  frontend:
    environment:
      - REACT_APP_API_URL=http://backend:8000
      - REACT_APP_WS_URL=ws://backend:8000
```

## Available API Endpoints

All endpoints are defined in `frontend/src/config/api.ts`:

- **currentConditions**: Current space weather conditions
- **predictStorm**: Storm prediction
- **predictImpact**: Impact prediction
- **historical(timeRange)**: Historical data (24h, 7d, etc.)
- **satellites**: Satellite fleet status
- **chatbot**: AI chatbot interaction
- **economyLoss**: Economic impact calculations
- **confidenceSummary**: Model confidence metrics
- **modelImprovementStatus**: Model improvement tracking
- **websocket**: WebSocket connection for real-time updates

## Benefits of This Approach

1. **Flexibility**: Easy to switch between development and production
2. **Security**: Sensitive URLs and keys stored in .env files
3. **Maintainability**: Single source of truth for all API endpoints
4. **Scalability**: Easy to update API URLs across entire application
5. **Best Practice**: Follows 12-factor app methodology
