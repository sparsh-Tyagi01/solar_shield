# Quick Deployment Reference

## Files Updated for Cloud Deployment

### ✅ Backend Configuration
- **backend/config.py**: Now checks `PORT` env var first (for Render/Heroku)
- **backend/main.py**: Updated startup to prioritize cloud platform PORT
- **backend/.env**: Documented PORT usage

### ✅ Deployment Files Created
- **Procfile**: For Heroku and Render compatibility
- **render.yaml**: Infrastructure as Code for Render
- **RENDER_DEPLOYMENT.md**: Complete deployment guide

## Key Changes

### Port Binding Fix
```python
# Old (failed on Render):
port = API_PORT  # Used hardcoded 8000

# New (works on all platforms):
port = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
# Priority: PORT (cloud) → API_PORT (local) → 8000 (default)
```

### Start Command
```bash
# Render automatically provides $PORT environment variable
# Use python -m to ensure proper module imports
python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

**Why `python -m uvicorn`?**
- Ensures Python's module system is used
- Properly resolves `backend` package imports
- More reliable than calling `uvicorn` directly

## Quick Deploy to Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Fix port binding for Render deployment"
   git push
   ```

2. **In Render Dashboard**
   - New → Web Service
   - Connect GitHub repo
   - Start Command: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (see RENDER_DEPLOYMENT.md)

3. **Deploy**
   - Render will automatically build and deploy
   - Check logs for: `INFO: Starting server on 0.0.0.0:10000`

## Environment Variables for Production

**Required:**
```bash
API_HOST=0.0.0.0
API_DEBUG=False
```

**Optional (with defaults):**
```bash
FRONTEND_URL=https://your-frontend.com
N2YO_API_KEY=your-satellite-api-key
ANTHROPIC_API_KEY=your-ai-api-key
```

## Verify Deployment

After deployment, check:
1. **Root endpoint**: `https://your-app.onrender.com/`
   - Should return API info
2. **Health check**: `https://your-app.onrender.com/health`
   - Should return service status
3. **Logs**: Check for startup message
   ```
   INFO: Starting server on 0.0.0.0:10000
   INFO: Uvicorn running on http://0.0.0.0:10000
   ```

## Common Issues

### ❌ "Port scan timeout reached"
**Cause**: App not binding to Render's PORT variable

**Fix**: ✅ Already fixed in current code

### ❌ "ModuleNotFoundError: No module named 'backend'"
**Cause**: Python can't find the backend package

**Fix**: ✅ Fixed by using `python -m uvicorn` instead of just `uvicorn`

Ensure your start command is:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Alternative: Use the startup script:
```bash
bash start_server.sh
```

### ❌ "Module not found" (other packages)
**Cause**: Missing dependencies in requirements.txt

**Fix**: Ensure all imports are in requirements.txt

### ❌ CORS errors in frontend
**Cause**: FRONTEND_URL not configured

**Fix**: Set FRONTEND_URL in Render environment variables

## Local Testing of Production Setup

```bash
# Test with Render-like port
export PORT=10000
python -m backend.main

# Should see:
# INFO: Starting server on 0.0.0.0:10000
```

## Next Steps

1. Deploy backend to Render
2. Update frontend .env with backend URL:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   REACT_APP_WS_URL=wss://your-backend.onrender.com
   ```
3. Deploy frontend (Vercel/Netlify/Render)
4. Update backend FRONTEND_URL with frontend URL
5. Test end-to-end

## Full Documentation

- **RENDER_DEPLOYMENT.md**: Complete Render deployment guide
- **API_CONFIG.md**: API configuration and environment variables
- **DEPLOYMENT.md**: General deployment information
