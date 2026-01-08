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
import shap

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
        # Note: This requires severity_score which we get from Model B
        # For simplicity, calculate approximate severity
        sym_h_approx = data.bz * 10 if data.bz < 0 else 0
        severity_approx = abs(sym_h_approx / 20)
        
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


@app.websocket("/realtime/stream")
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
                
                # Make predictions
                data = SpaceWeatherData(**realtime_data)
                
                storm_pred = await predict_storm(data)
                severity_pred = await predict_severity(data)
                impact_pred = await predict_impact(data)
                
                # Send update
                await websocket.send_json({
                    "timestamp": datetime.utcnow().isoformat(),
                    "current_conditions": realtime_data,
                    "predictions": {
                        "storm_occurrence": storm_pred.dict(),
                        "severity": severity_pred.dict(),
                        "impacts": impact_pred.dict()
                    },
                    "visual_params": calculate_visual_params(realtime_data),
                    "cme_progress": 0.5  # Mock value - calculate based on time since detection
                })
                
                # Wait for next update
                await asyncio.sleep(UPDATE_INTERVAL)
                
            except WebSocketDisconnect:
                logger.info("WebSocket disconnected")
                break
            except Exception as e:
                logger.error(f"Error in WebSocket stream: {e}")
                await asyncio.sleep(UPDATE_INTERVAL)
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        logger.info("WebSocket connection closed")


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
