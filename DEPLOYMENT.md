# SolarShield Deployment Guide

## Project Structure

```
SolarSheild/
├── backend/              # FastAPI backend
│   ├── data/            # Data fetching & processing
│   ├── ml/              # ML models
│   ├── utils/           # Utilities
│   ├── Dockerfile       # Backend container
│   └── README.md
├── frontend/            # React frontend
│   ├── src/
│   ├── public/
│   ├── Dockerfile       # Frontend container
│   └── nginx.conf
├── data/               # Training & processed data
├── models/             # Trained ML models
├── logs/               # Application logs
├── docs/               # Documentation
├── tests/              # Test files
├── scripts/            # Setup & utility scripts
├── docker-compose.yml  # Docker orchestration
├── requirements.txt    # Python dependencies
└── README.md
```

## Local Development

### Backend
```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn backend.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Docker Deployment

### Build and run with Docker Compose:
```bash
docker-compose up --build
```

Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Individual containers:

**Backend:**
```bash
cd backend
docker build -t solarsheild-backend .
docker run -p 8000:8000 solarsheild-backend
```

**Frontend:**
```bash
cd frontend
docker build -t solarsheild-frontend .
docker run -p 80:80 solarsheild-frontend
```

## Production Deployment

### Environment Variables

Create `.env` file for production:
```env
# Backend
PYTHONUNBUFFERED=1
LOG_LEVEL=INFO

# Frontend (build time)
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com
```

### Cloud Deployment Options

#### Option 1: Docker-based hosting (AWS ECS, Azure Container Instances, Google Cloud Run)
1. Build and push images to container registry
2. Deploy using docker-compose or platform-specific tools
3. Configure load balancer and SSL certificates

#### Option 2: Platform as a Service
- **Backend**: Deploy to Heroku, Railway, or Render
- **Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages

#### Option 3: Traditional VPS (DigitalOcean, Linode, AWS EC2)
```bash
# On server
git clone <repository>
cd SolarSheild
docker-compose up -d
```

### SSL/HTTPS Setup

Add to docker-compose.yml with Certbot for Let's Encrypt:
```yaml
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx-prod.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    ports:
      - "443:443"
      - "80:80"
```

## Monitoring & Maintenance

- Logs: `docker-compose logs -f`
- Restart: `docker-compose restart`
- Update: `git pull && docker-compose up --build -d`
- Stop: `docker-compose down`

## Backup Strategy

Important directories to backup:
- `data/` - Training and processed data
- `models/` - Trained ML models
- `logs/` - Application logs

## Performance Optimization

1. **Backend**: Use gunicorn with multiple workers
2. **Frontend**: Enable gzip compression in nginx
3. **Caching**: Configure Redis for API caching
4. **CDN**: Use CDN for static assets

## Troubleshooting

- **Port conflicts**: Change ports in docker-compose.yml
- **Memory issues**: Increase Docker memory allocation
- **CORS errors**: Update CORS settings in backend/main.py
- **WebSocket issues**: Check nginx proxy configuration
