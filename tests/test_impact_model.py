#!/usr/bin/env python3
"""
Quick test to verify the impact risk model loads correctly
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from backend.ml.impact_risk import ImpactRiskClassifier
from backend.config import IMPACT_RISK_MODEL_PATH
from backend.utils.logger import get_logger

logger = get_logger(__name__)

def test_model_loading():
    """Test loading and using the impact risk model"""
    logger.info("=" * 60)
    logger.info("Testing Impact Risk Model Loading")
    logger.info("=" * 60)
    
    try:
        # Check if file exists
        if not IMPACT_RISK_MODEL_PATH.exists():
            logger.error(f"Model file not found: {IMPACT_RISK_MODEL_PATH}")
            return False
        
        logger.info(f"✓ Model file found: {IMPACT_RISK_MODEL_PATH}")
        logger.info(f"  File size: {IMPACT_RISK_MODEL_PATH.stat().st_size / 1024:.1f} KB")
        
        # Load model
        model = ImpactRiskClassifier()
        model.load()
        logger.info("✓ Model loaded successfully")
        
        # Check model properties
        logger.info(f"  Features: {model.features}")
        logger.info(f"  Categories: {model.impact_categories}")
        logger.info(f"  Is trained: {model.is_trained}")
        
        # Test prediction
        test_data = {
            'severity_score': 5.0,
            'bz_min': -15.0,
            'speed_max': 600.0,
            'proton_flux_max': 50.0,
            'xray_flux_max': 1e-5,
            'storm_duration': 12.0
        }
        
        logger.info("\nTesting prediction with sample data:")
        logger.info(f"  {test_data}")
        
        prediction = model.predict_single(test_data)
        
        logger.info("\n✓ Prediction successful:")
        for category, result in prediction.items():
            logger.info(f"  {category}: risk={result['risk']:.2%}, status={result['status']}, affected={result['affected']}")
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ All tests passed! Model is ready to use.")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error testing model: {e}", exc_info=True)
        return False


if __name__ == "__main__":
    success = test_model_loading()
    sys.exit(0 if success else 1)
