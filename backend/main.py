"""
FastAPI Backend for SolarGuard 3D
Main application with all prediction endpoints
"""
import asyncio
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
# import shap  # Optional - only needed for SHAP explanations

from backend.ml import (
    StormOccurrencePredictor,
    StormSeverityPredictor,
    ImpactRiskClassifier
)
from backend.data import get_fetcher, FeatureEngineer
from backend.utils import (
    risk_level,
    categorize_severity,
    get_impacts,
    calculate_visual_params,
    generate_explanation,
    validate_data,
    get_time_to_impact,
    format_timestamp
)
from backend.utils.logger import get_logger
from backend.config import (
    API_HOST,
    API_PORT,
    UPDATE_INTERVAL,
    STORM_OCCURRENCE_MODEL_PATH,
    STORM_SEVERITY_MODEL_PATH,
    IMPACT_RISK_MODEL_PATH
)

logger = get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SolarGuard 3D API",
    description="AI-Powered Space Weather Intelligence Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances
occurrence_model = None
severity_model = None
impact_model = None
data_fetcher = None
feature_engineer = None

# Global satellite fleet state
satellite_fleet = []


def initialize_satellite_fleet():
    """Initialize satellite fleet with realistic starting conditions based on current space weather"""
    global satellite_fleet
    
    # Get current space weather conditions to determine initial health
    try:
        current_conditions = data_fetcher.fetch_realtime_data() if data_fetcher else None
        # Calculate base health from recent conditions (90-98% depending on recent activity)
        if current_conditions:
            radiation_level = abs(current_conditions.get('bz', 0)) + current_conditions.get('xray_flux', 0) * 1e6
            base_health = max(85, min(98, 98 - radiation_level * 0.5))
        else:
            base_health = 95
    except:
        base_health = 95
    
    satellite_fleet = [
        {
            'id': 'sat-1',
            'name': 'GPS-IIF-12',
            'type': 'GPS',
            'health': base_health + np.random.uniform(-3, 2),
            'degradation': np.random.uniform(0, 5),
            'altitude': 20200,
            'orbitalPeriod': 40,
            'inclination': 55,  # degrees
            'phase': 0
        },
        {
            'id': 'sat-2',
            'name': 'TDRS-13',
            'type': 'Communication',
            'health': base_health + np.random.uniform(-3, 2),
            'degradation': np.random.uniform(0, 5),
            'altitude': 35786,
            'orbitalPeriod': 60,
            'inclination': 15,
            'phase': 60
        },
        {
            'id': 'sat-3',
            'name': 'GOES-18',
            'type': 'Weather',
            'health': base_health + np.random.uniform(-3, 2),
            'degradation': np.random.uniform(0, 5),
            'altitude': 35786,
            'orbitalPeriod': 60,
            'inclination': 0,
            'phase': 180
        },
        {
            'id': 'sat-4',
            'name': 'ISS',
            'type': 'ISS',
            'health': base_health + np.random.uniform(-5, 0),  # ISS more vulnerable
            'degradation': np.random.uniform(2, 8),
            'altitude': 408,
            'orbitalPeriod': 30,
            'inclination': 51.6,
            'phase': 90
        },
        {
            'id': 'sat-5',
            'name': 'GPS-IIF-07',
            'type': 'GPS',
            'health': base_health + np.random.uniform(-3, 2),
            'degradation': np.random.uniform(0, 5),
            'altitude': 20200,
            'orbitalPeriod': 40,
            'inclination': 55,
            'phase': 180
        },
        {
            'id': 'sat-6',
            'name': 'Hubble Space Telescope',
            'type': 'Research',
            'health': base_health + np.random.uniform(-4, 1),
            'degradation': np.random.uniform(5, 12),  # Older satellite
            'altitude': 547,
            'orbitalPeriod': 32,
            'inclination': 28.5,
            'phase': 270
        }
    ]
    
    logger.info(f"Satellite fleet initialized with {len(satellite_fleet)} satellites, avg health: {np.mean([s['health'] for s in satellite_fleet]):.1f}%")
    return satellite_fleet


def update_satellite_health(radiation_level: float, solar_wind_speed: float):
    """Update satellite health based on current space weather"""
    global satellite_fleet
    
    if not satellite_fleet:
        initialize_satellite_fleet()
        return
    
    for satellite in satellite_fleet:
        # Calculate degradation based on space weather and satellite type
        vulnerability = {
            'ISS': 2.0,
            'Research': 1.5,
            'GPS': 1.0,
            'Communication': 1.2,
            'Weather': 0.9
        }.get(satellite['type'], 1.0)
        
        # Degradation increases with radiation and solar wind
        degradation_rate = (radiation_level * 0.02 + solar_wind_speed / 500) * vulnerability
        satellite['degradation'] = min(100, satellite['degradation'] + degradation_rate)
        
        # Health decreases as degradation increases
        satellite['health'] = max(0, 100 - satellite['degradation'] * 0.8)
    
    return satellite_fleet


def safe_to_dict(obj):
    """Safely convert Pydantic model or dict to dict"""
    if isinstance(obj, dict):
        return obj
    elif hasattr(obj, 'model_dump'):
        return obj.model_dump()
    elif hasattr(obj, 'dict'):
        return obj.dict()
    else:
        return obj


# Pydantic models for request/response
class SpaceWeatherData(BaseModel):
    """Input data for predictions"""
    bz: float = Field(..., description="IMF Bz component (nT)")
    speed: float = Field(..., description="Solar wind speed (km/s)")
    density: float = Field(..., description="Proton density (n/cm³)")
    pressure: float = Field(None, description="Solar wind pressure (nPa)")
    xray_flux: float = Field(None, description="X-ray flux (W/m²)")
    proton_flux: float = Field(None, description="Proton flux (pfu)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "bz": -8.5,
                "speed": 550.0,
                "density": 12.0,
                "pressure": 3.5,
                "xray_flux": 1.5e-5,
                "proton_flux": 15.0
            }
        }


class StormOccurrencePrediction(BaseModel):
    """Storm occurrence prediction response"""
    will_storm_occur: bool
    probability: float
    confidence: float
    risk_level: str
    timestamp: str


class StormSeverityPrediction(BaseModel):
    """Storm severity prediction response"""
    severity_score: float
    category: str
    expected_impacts: List[str]
    timestamp: str


class ImpactPrediction(BaseModel):
    """Impact risk prediction response"""
    satellites: Dict[str, Any]
    gps: Dict[str, Any]
    communication: Dict[str, Any]
    power_grid: Dict[str, Any]
    affected_systems: List[str]
    timestamp: str


@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    global occurrence_model, severity_model, impact_model, data_fetcher, feature_engineer
    
    logger.info("Starting SolarGuard 3D API...")
    
    try:
        # Initialize data fetcher and feature engineer
        data_fetcher = get_fetcher()
        feature_engineer = FeatureEngineer()
        logger.info("Data fetcher and feature engineer initialized")
        
        # Load models
        logger.info("Loading trained models...")
        
        # Check if models exist
        if STORM_OCCURRENCE_MODEL_PATH.exists():
            occurrence_model = StormOccurrencePredictor()
            occurrence_model.load()
            logger.info("✓ Storm occurrence model loaded")
        else:
            logger.warning("⚠ Storm occurrence model not found. Train models first.")
            
        # Initialize satellite fleet
        initialize_satellite_fleet()
        
        if STORM_SEVERITY_MODEL_PATH.exists():
            severity_model = StormSeverityPredictor()
            severity_model.load()
            logger.info("✓ Storm severity model loaded")
        else:
            logger.warning("⚠ Storm severity model not found. Train models first.")
        
        if IMPACT_RISK_MODEL_PATH.exists():
            impact_model = ImpactRiskClassifier()
            impact_model.load()
            logger.info("✓ Impact risk model loaded")
        else:
            logger.warning("⚠ Impact risk model not found. Train models first.")
            logger.info("   To train the impact risk model, run: python -m backend.ml.train_pipeline")
            logger.info("   The system will continue with fallback impact predictions.")
        
        logger.info("SolarGuard 3D API ready! 🌞")
        
    except Exception as e:
        logger.error(f"Error loading models: {e}", exc_info=True)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "SolarGuard 3D API",
        "version": "1.0.0",
        "status": "operational",
        "description": "AI-Powered Space Weather Intelligence Platform"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = {
        "storm_occurrence": occurrence_model is not None and occurrence_model.is_trained,
        "storm_severity": severity_model is not None and severity_model.is_trained,
        "impact_risk": impact_model is not None and impact_model.is_trained
    }
    
    return {
        "status": "healthy" if all(models_loaded.values()) else "degraded",
        "models": models_loaded,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/satellites")
async def get_satellite_fleet():
    """
    Get current satellite fleet status
    Returns real-time satellite health and position data
    """
    global satellite_fleet
    
    if not satellite_fleet:
        initialize_satellite_fleet()
    
    return {
        "satellites": satellite_fleet,
        "count": len(satellite_fleet),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/predict/storm", response_model=StormOccurrencePrediction)
async def predict_storm(data: SpaceWeatherData):
    """
    Predict if geomagnetic storm will occur in next 12-24 hours
    
    MODEL A: XGBoost Binary Classifier
    """
    if occurrence_model is None or not occurrence_model.is_trained:
        raise HTTPException(status_code=503, detail="Storm occurrence model not available")
    
    try:
        # Prepare features
        input_data = data.dict()
        
        # Calculate derived features
        input_data['bz_rolling_30min'] = input_data['bz']
        input_data['speed_rolling_mean'] = input_data['speed']
        input_data['bz_gradient'] = 0  # Can't calculate without history
        input_data['pressure_spike'] = 0
        
        # Calculate energy coupling
        bz = input_data['bz']
        speed = input_data['speed']
        energy_coupling = abs(speed * (min(bz, 0) ** 2) * (np.sin(np.radians(45/2)) ** 4))
        input_data['energy_coupling'] = energy_coupling
        
        # Predict
        prediction = occurrence_model.predict_single(input_data)
        prediction['timestamp'] = format_timestamp(datetime.utcnow())
        
        logger.info(f"Storm occurrence prediction: {prediction['will_storm_occur']} "
                   f"(prob={prediction['probability']:.3f})")
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error in storm prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/severity", response_model=StormSeverityPrediction)
async def predict_severity(data: SpaceWeatherData):
    """
    Predict storm severity (0-10 scale)
    
    MODEL B: LSTM Time-Series Predictor
    Note: For production, you'd need a sequence of data points
    """
    if severity_model is None or not severity_model.is_trained:
        raise HTTPException(status_code=503, detail="Storm severity model not available")
    
    try:
        # For demo, create a mock sequence with current values
        # In production, you'd have a rolling buffer of recent data
        input_array = np.array([[
            data.bz,
            data.proton_flux or 1.0,
            data.xray_flux or 1e-6,
            data.pressure or 2.0,
            data.speed,
            abs(data.speed * (min(data.bz, 0) ** 2) * (np.sin(np.radians(45/2)) ** 4))
        ]])
        
        # Repeat to create sequence
        sequence = np.repeat(input_array, severity_model.sequence_length, axis=0)
        
        # Predict
        prediction = severity_model.predict_single_sequence(sequence)
        prediction['timestamp'] = format_timestamp(datetime.utcnow())
        
        logger.info(f"Storm severity prediction: {prediction['severity_score']:.2f} "
                   f"({prediction['category']})")
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error in severity prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/impact", response_model=ImpactPrediction)
async def predict_impact(data: SpaceWeatherData):
    """
    Classify which systems will be affected
    
    MODEL C: Random Forest Multi-Label Classifier
    """
    if impact_model is None or not impact_model.is_trained:
        raise HTTPException(status_code=503, detail="Impact risk model not available")
    
    try:
        # Prepare features
        # Use proper severity calculation - bz of -10 should give severity ~5, -20 gives ~10
        severity_approx = abs(data.bz) if data.bz < 0 else 0
        severity_approx += (data.speed - 400) / 100 if data.speed > 400 else 0
        severity_approx = max(0, min(10, severity_approx))  # Clamp to 0-10
        
        input_data = {
            'severity_score': severity_approx,
            'bz_min': data.bz,
            'speed_max': data.speed,
            'proton_flux_max': data.proton_flux or 1.0,
            'xray_flux_max': data.xray_flux or 1e-6,
            'storm_duration': 0
        }
        
        # Predict
        prediction = impact_model.predict_single(input_data)
        
        # Get affected systems
        affected = [cat for cat, info in prediction.items() if info['affected']]
        
        response = {
            **prediction,
            'affected_systems': affected,
            'timestamp': format_timestamp(datetime.utcnow())
        }
        
        logger.info(f"Impact prediction: {len(affected)} systems affected")
        
        return response
        
    except Exception as e:
        logger.error(f"Error in impact prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict/all")
async def predict_all(bz: float, speed: float, density: float,
                     pressure: float = None, xray_flux: float = None,
                     proton_flux: float = None):
    """
    Get all predictions at once
    Convenient endpoint for complete analysis
    """
    data = SpaceWeatherData(
        bz=bz,
        speed=speed,
        density=density,
        pressure=pressure,
        xray_flux=xray_flux,
        proton_flux=proton_flux
    )
    
    try:
        storm_pred = await predict_storm(data)
        severity_pred = await predict_severity(data)
        impact_pred = await predict_impact(data)
        
        return {
            "storm_occurrence": storm_pred.dict(),
            "storm_severity": severity_pred.dict(),
            "impact_risk": impact_pred.dict(),
            "visual_params": calculate_visual_params(data.dict()),
            "timestamp": format_timestamp(datetime.utcnow())
        }
        
    except Exception as e:
        logger.error(f"Error in combined prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/realtime/status")
async def get_realtime_status():
    """
    Get current real-time space weather status
    Fetches latest data from NASA/NOAA sources
    """
    try:
        # Fetch latest data
        realtime_data = data_fetcher.fetch_realtime_data()
        
        # Make predictions
        data = SpaceWeatherData(**realtime_data)
        
        storm_pred = await predict_storm(data)
        severity_pred = await predict_severity(data)
        impact_pred = await predict_impact(data)
        
        return {
            "current_conditions": realtime_data,
            "predictions": {
                "storm_occurrence": storm_pred.dict(),
                "severity": severity_pred.dict(),
                "impacts": impact_pred.dict()
            },
            "visual_params": calculate_visual_params(realtime_data),
            "timestamp": realtime_data['timestamp']
        }
        
    except Exception as e:
        logger.error(f"Error fetching real-time status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/explain/shap")
async def explain_prediction(bz: float, speed: float, density: float):
    """
    Get SHAP explanation for storm occurrence prediction
    Explains WHY the model made its prediction
    """
    try:
        import shap
    except ImportError:
        raise HTTPException(status_code=503, detail="SHAP library not installed")
    
    if occurrence_model is None or not occurrence_model.is_trained:
        raise HTTPException(status_code=503, detail="Model not available")
    
    try:
        import pandas as pd
        
        # Prepare input
        input_data = {
            'bz_rolling_30min': bz,
            'speed': speed,
            'density': density,
            'bz_gradient': 0,
            'pressure_spike': 0,
            'energy_coupling': abs(speed * (min(bz, 0) ** 2) * (np.sin(np.radians(45/2)) ** 4))
        }
        
        df = pd.DataFrame([input_data])
        
        # Create SHAP explainer
        explainer = shap.TreeExplainer(occurrence_model.model)  # Use .model attribute
        shap_values = explainer.shap_values(df[occurrence_model.features])
        
        # Get feature importance - convert numpy types to Python floats
        feature_importance = {
            str(feature): float(shap_val)
            for feature, shap_val in zip(occurrence_model.features, shap_values[0])
        }
        
        # Generate explanation
        explanation = generate_explanation(shap_values[0], occurrence_model.features)
        
        # Get prediction and convert to Python float
        prediction_proba = occurrence_model.predict_proba(df)[0]
        
        return {
            "feature_importance": feature_importance,
            "reasoning": explanation,
            "base_value": float(explainer.expected_value),
            "prediction": float(prediction_proba)
        }
        
    except Exception as e:
        logger.error(f"Error generating SHAP explanation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def realtime_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time data streaming
    Updates every minute with latest predictions
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            try:
                # Fetch latest data
                realtime_data = data_fetcher.fetch_realtime_data()
                
                # Update satellite health based on current conditions
                radiation_level = abs(realtime_data.get('bz', 0)) + realtime_data.get('xray_flux', 0) * 1e6
                update_satellite_health(radiation_level, realtime_data.get('speed', 400))
                
                # Make predictions
                data = SpaceWeatherData(**realtime_data)
                
                storm_pred = await predict_storm(data)
                severity_pred = await predict_severity(data)
                
                # Handle impact prediction - it may not be available
                try:
                    impact_pred = await predict_impact(data)
                    impact_dict = safe_to_dict(impact_pred)
                except HTTPException as e:
                    # If impact model not available, use mock prediction
                    logger.warning(f"Impact model unavailable, using fallback: {e.detail}")
                    impact_dict = {
                        'satellites': {'risk': 0.3, 'status': 'LOW', 'affected': False},
                        'gps': {'risk': 0.2, 'status': 'LOW', 'affected': False},
                        'communication': {'risk': 0.25, 'status': 'LOW', 'affected': False},
                        'power_grid': {'risk': 0.15, 'status': 'MINIMAL', 'affected': False},
                        'affected_systems': [],
                        'timestamp': format_timestamp(datetime.utcnow())
                    }
                
                # Send update with satellite data
                await websocket.send_json({
                    "timestamp": datetime.utcnow().isoformat(),
                    "bz": realtime_data.get('bz', 0),
                    "speed": realtime_data.get('speed', 400),
                    "density": realtime_data.get('density', 5),
                    "pressure": realtime_data.get('pressure', 2.0),
                    "kp_index": realtime_data.get('kp_index', 3),
                    "current_conditions": realtime_data,
                    "satellites": satellite_fleet,  # Include satellite data
                    "predictions": {
                        "storm_occurrence": safe_to_dict(storm_pred),
                        "severity": safe_to_dict(severity_pred),
                        "impacts": impact_dict
                    },
                    "visual_params": calculate_visual_params(realtime_data),
                    "cme_progress": 0.5  # Mock value - calculate based on time since detection
                })
                
                # Wait for next update
                await asyncio.sleep(UPDATE_INTERVAL)
                
            except WebSocketDisconnect:
                logger.info("WebSocket disconnected")
                break
            except HTTPException as e:
                logger.error(f"HTTP error in WebSocket stream: {e.status_code} - {e.detail}")
                await asyncio.sleep(UPDATE_INTERVAL)
            except Exception as e:
                logger.error(f"Error in WebSocket stream: {e}", exc_info=True)
                await asyncio.sleep(UPDATE_INTERVAL)
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        logger.info("WebSocket connection closed")


@app.get("/api/current-conditions")
async def get_current_conditions():
    """Get current space weather conditions"""
    try:
        # Fetch latest data from NASA/NOAA
        realtime_data = data_fetcher.fetch_realtime_data()
        
        return {
            "bz": realtime_data.get('bz', 0),
            "speed": realtime_data.get('speed', 400),
            "density": realtime_data.get('density', 5),
            "pressure": realtime_data.get('pressure', 2.0),
            "kp_index": realtime_data.get('kp_index', 3),
            "xray_flux": realtime_data.get('xray_flux', 1e-6),
            "proton_flux": realtime_data.get('proton_flux', 1.0),
            "timestamp": format_timestamp(datetime.utcnow())
        }
    except Exception as e:
        logger.warning(f"Error fetching real-time data, using mock data: {e}")
        # Return mock data if real-time fetch fails
        return {
            "bz": -5.0 + np.random.randn() * 3,
            "speed": 450 + np.random.randn() * 50,
            "density": 8.0 + np.random.randn() * 2,
            "pressure": 2.5 + np.random.randn() * 0.5,
            "kp_index": 3 + int(np.random.randn()),
            "xray_flux": 1e-6,
            "proton_flux": 5.0,
            "timestamp": format_timestamp(datetime.utcnow())
        }


@app.get("/api/predict/storm")
async def get_storm_prediction():
    """Get storm prediction based on current conditions"""
    try:
        # Get current conditions
        conditions = await get_current_conditions()
        
        # Create data object
        data = SpaceWeatherData(
            bz=conditions['bz'],
            speed=conditions['speed'],
            density=conditions['density'],
            pressure=conditions.get('pressure'),
            xray_flux=conditions.get('xray_flux'),
            proton_flux=conditions.get('proton_flux')
        )
        
        # Get predictions
        storm_pred = await predict_storm(data)
        severity_pred = await predict_severity(data)
        
        # Determine alert level
        prob = storm_pred['probability'] if isinstance(storm_pred, dict) else storm_pred.probability
        severity = severity_pred['severity_score'] if isinstance(severity_pred, dict) else severity_pred.severity_score
        
        if prob > 0.7 and severity > 7:
            alert_level = "critical"
        elif prob > 0.5 and severity > 5:
            alert_level = "warning"
        elif prob > 0.3:
            alert_level = "watch"
        else:
            alert_level = "normal"
        
        # Handle both dict and Pydantic model responses
        if isinstance(storm_pred, dict):
            storm_data = storm_pred
        else:
            storm_data = storm_pred.dict()
            
        if isinstance(severity_pred, dict):
            severity_data = severity_pred
        else:
            severity_data = severity_pred.dict()
        
        return {
            "storm_probability": storm_data['probability'],
            "severity": severity_data['severity_score'],
            "alert_level": alert_level,
            "will_storm_occur": storm_data['will_storm_occur'],
            "category": severity_data['category'],
            "risk_level": storm_data['risk_level'],
            "timestamp": storm_data.get('timestamp', format_timestamp(datetime.utcnow()))
        }
        
    except Exception as e:
        logger.error(f"Error in storm prediction endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/predict/impact")
async def get_impact_prediction():
    """Get impact prediction based on current conditions"""
    try:
        # Get current conditions
        conditions = await get_current_conditions()
        
        # Create data object
        data = SpaceWeatherData(
            bz=conditions['bz'],
            speed=conditions['speed'],
            density=conditions['density'],
            pressure=conditions.get('pressure'),
            xray_flux=conditions.get('xray_flux'),
            proton_flux=conditions.get('proton_flux')
        )
        
        # Check if impact model is available
        if impact_model is None or not impact_model.is_trained:
            # Return mock impact data if model not available
            logger.warning("Impact model not available, returning mock data")
            
            # Calculate risk based on severity
            severity_pred = await predict_severity(data)
            severity = severity_pred['severity_score'] if isinstance(severity_pred, dict) else severity_pred.severity_score
            
            risk_factor = severity / 10.0
            
            return {
                "satellites": {
                    "risk": min(risk_factor * 0.8, 1.0),
                    "affected": risk_factor > 0.5
                },
                "gps": {
                    "risk": min(risk_factor * 0.7, 1.0),
                    "affected": risk_factor > 0.6
                },
                "communication": {
                    "risk": min(risk_factor * 0.6, 1.0),
                    "affected": risk_factor > 0.7
                },
                "power_grid": {
                    "risk": min(risk_factor * 0.9, 1.0),
                    "affected": risk_factor > 0.8
                },
                "affected_systems": [
                    cat for cat in ["satellites", "gps", "communication", "power_grid"]
                    if (cat == "satellites" and risk_factor > 0.5) or
                       (cat == "gps" and risk_factor > 0.6) or
                       (cat == "communication" and risk_factor > 0.7) or
                       (cat == "power_grid" and risk_factor > 0.8)
                ],
                "timestamp": format_timestamp(datetime.utcnow())
            }
        
        # Get impact prediction
        impact_pred = await predict_impact(data)
        
        return impact_pred
        
    except Exception as e:
        logger.error(f"Error in impact prediction endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/historical/{time_range}")
async def get_historical_data(time_range: str):
    """Get historical space weather data"""
    try:
        # Parse time range
        if time_range == "24h":
            hours = 24
        elif time_range == "7d":
            hours = 24 * 7
        elif time_range == "30d":
            hours = 24 * 30
        else:
            hours = 24
        
        # Generate mock historical data (in production, fetch from database)
        from datetime import timedelta
        
        data_points = []
        now = datetime.utcnow()
        num_points = min(hours, 100)  # Limit to 100 points for performance
        
        for i in range(num_points):
            time_offset = timedelta(hours=hours * (1 - i / num_points))
            timestamp = now - time_offset
            
            # Generate realistic-looking data with some variation
            base_bz = -5 + np.sin(i * 0.1) * 10
            base_speed = 400 + np.sin(i * 0.05) * 100
            base_density = 8 + np.sin(i * 0.08) * 4
            
            data_points.append({
                "timestamp": timestamp.isoformat(),
                "bz": float(base_bz + np.random.randn() * 2),
                "speed": float(base_speed + np.random.randn() * 20),
                "density": float(max(0, base_density + np.random.randn() * 1)),
                "pressure": float(2.5 + np.random.randn() * 0.5),
                "kp_index": int(max(0, min(9, 3 + np.random.randn())))
            })
        
        return data_points
        
    except Exception as e:
        logger.error(f"Error fetching historical data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/info")
async def get_models_info():
    """Get information about loaded models"""
    info = {}
    
    if occurrence_model and occurrence_model.is_trained:
        info['storm_occurrence'] = {
            'type': 'XGBoost Binary Classifier',
            'features': occurrence_model.features,
            'feature_importance': occurrence_model.get_feature_importance().to_dict('records')[:5]
        }
    
    if severity_model and severity_model.is_trained:
        info['storm_severity'] = {
            'type': 'LSTM Time-Series Predictor',
            'sequence_length': severity_model.sequence_length,
            'features': severity_model.features
        }
    
    if impact_model and impact_model.is_trained:
        info['impact_risk'] = {
            'type': 'Random Forest Multi-Label Classifier',
            'categories': impact_model.impact_categories,
            'features': impact_model.features
        }
    
    return info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=True,
        log_level="info"
    )
