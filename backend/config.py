"""
Configuration management for SolarGuard 3D
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
LOG_DIR = BASE_DIR / "logs"

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
MODEL_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)
(DATA_DIR / "raw").mkdir(exist_ok=True)
(DATA_DIR / "processed").mkdir(exist_ok=True)

# API Configuration
# Render.com and other cloud platforms use PORT env variable
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
API_DEBUG = os.getenv("API_DEBUG", "True").lower() == "true"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Data Sources
NASA_OMNI_URL = os.getenv("NASA_OMNI_URL", "https://omniweb.gsfc.nasa.gov/cgi/nx1.cgi")
NOAA_GOES_URL = os.getenv("NOAA_GOES_URL", "https://services.swpc.noaa.gov/json/goes")

# Model Paths
STORM_OCCURRENCE_MODEL_PATH = MODEL_DIR / "storm_occurrence.pkl"
STORM_SEVERITY_MODEL_PATH = MODEL_DIR / "storm_severity.h5"
IMPACT_RISK_MODEL_PATH = MODEL_DIR / "impact_risk.pkl"
FEATURE_SCALER_PATH = MODEL_DIR / "feature_scaler.pkl"

# Training Configuration
TRAIN_TEST_SPLIT = float(os.getenv("TRAIN_TEST_SPLIT", 0.8))
RANDOM_SEED = int(os.getenv("RANDOM_SEED", 42))

# Real-time Configuration
UPDATE_INTERVAL = int(os.getenv("UPDATE_INTERVAL", 60))

# Storm Thresholds
STORM_SYM_H_THRESHOLD = -50  # nT
MODERATE_STORM_THRESHOLD = -100  # nT
SEVERE_STORM_THRESHOLD = -200  # nT

# Feature Configuration
ROLLING_WINDOW_30 = 30  # minutes
ROLLING_WINDOW_60 = 60  # minutes
SEQUENCE_LENGTH = 60  # for LSTM

# Model Features
OCCURRENCE_FEATURES = [
    'bz_rolling_30min',
    'speed',
    'density',
    'bz_gradient',
    'pressure_spike',
    'energy_coupling'
]

SEVERITY_FEATURES = [
    'bz_rolling_60min',
    'proton_flux',
    'xray_flux',
    'pressure',
    'speed',
    'energy_coupling'
]

IMPACT_FEATURES = [
    'severity_score',
    'bz_min',
    'speed_max',
    'proton_flux_max',
    'xray_flux_max',
    'storm_duration'
]

# Impact Categories
IMPACT_CATEGORIES = ['satellites', 'gps', 'communication', 'power_grid']
