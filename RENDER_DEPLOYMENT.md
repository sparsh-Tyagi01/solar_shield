# Render.com Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render.com account

## Quick Deploy

### Option 1: Using Render Dashboard (Recommended)

1. **Connect to GitHub**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Web Service**
   ```
   Name: solarsheild-backend
   Environment: Python 3
   Region: Choose nearest to your users
   Branch: main
   
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Set Environment Variables**
   Click "Environment" and add:
   ```
   API_HOST=0.0.0.0
   API_DEBUG=False
   FRONTEND_URL=https://your-frontend-url.com
   N2YO_API_KEY=your-key-here
   ANTHROPIC_API_KEY=your-key-here
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on every push to main

### Option 2: Using render.yaml (Infrastructure as Code)

1. **Push render.yaml to your repo**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

2. **Create New Blueprint Instance**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Select your repository
   - Render will read render.yaml and create services

3. **Set Secret Environment Variables**
   - Navigate to each service
   - Add sensitive variables not in render.yaml:
     - FRONTEND_URL
     - N2YO_API_KEY
     - ANTHROPIC_API_KEY

## Important Notes

### Port Binding
✅ **IMPORTANT**: The application now automatically uses Render's `PORT` environment variable.

The code checks for ports in this order:
1. `PORT` (provided by Render)
2. `API_PORT` (from .env for local dev)
3. Default: 8000

### CORS Configuration
Update `FRONTEND_URL` in environment variables to match your deployed frontend URL.

### Health Check
Render will ping your root endpoint `/` to verify the service is running.

## Deployment Commands

### Manual Deployment
If you need to manually trigger a deploy:
- Go to your service in Render Dashboard
- Click "Manual Deploy" → "Deploy latest commit"

### View Logs
- Dashboard → Your Service → "Logs" tab
- Or use Render CLI: `render logs -a solarsheild-backend`

## Troubleshooting

### Port Binding Timeout
❌ **Error**: "Port scan timeout reached, no open ports detected"

✅ **Solution**: This is now fixed. The app binds to `0.0.0.0:$PORT` automatically.

Verify in logs:
```
INFO: Starting server on 0.0.0.0:10000
INFO: Uvicorn running on http://0.0.0.0:10000
```

### Build Failures
- Check that `requirements.txt` is in the repo root
- Verify Python version compatibility
- Check build logs for missing dependencies

### Runtime Errors
- Check environment variables are set correctly
- Verify API keys are valid
- Check logs for specific error messages

## Frontend Deployment

### Deploy Frontend to Render

1. **Create Static Site**
   ```
   Name: solarsheild-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/build
   ```

2. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://solarsheild-backend.onrender.com
   REACT_APP_WS_URL=wss://solarsheild-backend.onrender.com
   ```

### Or Deploy Frontend to Vercel/Netlify
- Better performance for static sites
- Set the same environment variables

## Production Checklist

- [ ] Set `API_DEBUG=False` in environment variables
- [ ] Add production `FRONTEND_URL` to allow CORS
- [ ] Set valid API keys (N2YO, Anthropic)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts in Render
- [ ] Test all endpoints after deployment
- [ ] Verify WebSocket connections work

## Local Testing of Production Config

Test the production configuration locally:

```bash
# Set environment variables
export PORT=10000
export API_HOST=0.0.0.0
export API_DEBUG=False

# Run the app
python -m backend.main
```

Should see:
```
INFO: Starting server on 0.0.0.0:10000
```

## Updating Deployment

Push to main branch:
```bash
git add .
git commit -m "Update deployment config"
git push origin main
```

Render will automatically:
1. Pull latest code
2. Run build command
3. Restart service with new code

## Cost Optimization

- **Free Tier**: Available for testing (spins down after inactivity)
- **Starter**: $7/month (always on, better performance)
- **Standard**: $25/month (production workloads)

For free tier, note:
- Service spins down after 15 min inactivity
- First request after spin-down takes ~30 seconds

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Python on Render](https://render.com/docs/deploy-fastapi)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)
