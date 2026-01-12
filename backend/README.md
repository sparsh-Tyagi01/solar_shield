# SolarShield Backend

API backend for solar storm monitoring and prediction system.

## Setup

1. Create virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r ../requirements.txt
```

3. Run the server:
```bash
uvicorn backend.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Create a `.env` file in the project root if needed for custom configuration.

## Deployment

For production deployment:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Consider using gunicorn for production:
```bash
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
