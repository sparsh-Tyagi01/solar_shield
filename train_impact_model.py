#!/usr/bin/env python3
"""
Quick script to train the Impact Risk model
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd
import numpy as np
from backend.ml.impact_risk import ImpactRiskClassifier
from backend.config import DATA_DIR, IMPACT_RISK_MODEL_PATH
from backend.utils.logger import get_logger

logger = get_logger(__name__)


def generate_training_data(n_samples=1000):
    """Generate synthetic training data for impact risk model"""
    logger.info(f"Generating {n_samples} synthetic samples for impact risk training...")
    
    np.random.seed(42)
    
    # Generate features
    severity_scores = np.random.uniform(0, 10, n_samples)
    bz_min = np.random.uniform(-50, 5, n_samples)
    speed_max = np.random.uniform(300, 800, n_samples)
    proton_flux_max = np.random.uniform(0.1, 1000, n_samples)
    xray_flux_max = np.random.uniform(1e-7, 1e-4, n_samples)
    storm_duration = np.random.uniform(0, 48, n_samples)
    
    # Create features DataFrame
    X = pd.DataFrame({
        'severity_score': severity_scores,
        'bz_min': bz_min,
        'speed_max': speed_max,
        'proton_flux_max': proton_flux_max,
        'xray_flux_max': xray_flux_max,
        'storm_duration': storm_duration
    })
    
    # Generate labels based on severity and other factors
    # Rules:
    # - Satellites affected if severity > 6 or proton_flux > 100
    # - GPS affected if bz < -15 or severity > 7
    # - Communication affected if severity > 5 and (bz < -10 or speed > 600)
    # - Power Grid affected if severity > 8 and bz < -20
    
    satellites = (severity_scores > 6) | (proton_flux_max > 100)
    gps = (bz_min < -15) | (severity_scores > 7)
    communication = (severity_scores > 5) & ((bz_min < -10) | (speed_max > 600))
    power_grid = (severity_scores > 8) & (bz_min < -20)
    
    # Create labels DataFrame
    y = pd.DataFrame({
        'satellites': satellites.astype(int),
        'gps': gps.astype(int),
        'communication': communication.astype(int),
        'power_grid': power_grid.astype(int)
    })
    
    logger.info("Sample distribution:")
    logger.info(f"  Satellites affected: {satellites.sum()} ({satellites.sum()/n_samples*100:.1f}%)")
    logger.info(f"  GPS affected: {gps.sum()} ({gps.sum()/n_samples*100:.1f}%)")
    logger.info(f"  Communication affected: {communication.sum()} ({communication.sum()/n_samples*100:.1f}%)")
    logger.info(f"  Power Grid affected: {power_grid.sum()} ({power_grid.sum()/n_samples*100:.1f}%)")
    
    return X, y


def train_impact_model():
    """Train and save the impact risk model"""
    logger.info("=" * 60)
    logger.info("Training Impact Risk Classification Model")
    logger.info("=" * 60)
    
    try:
        # Generate training data
        X, y = generate_training_data(n_samples=1000)
        
        # Split into train and validation
        split_idx = int(0.8 * len(X))
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]
        
        logger.info(f"Training set: {len(X_train)} samples")
        logger.info(f"Validation set: {len(X_val)} samples")
        
        # Initialize and train model
        model = ImpactRiskClassifier()
        metrics = model.train(X_train, y_train, X_val, y_val)
        
        # Save model
        model.save(str(IMPACT_RISK_MODEL_PATH))
        
        logger.info("\n" + "=" * 60)
        logger.info("✓ Impact Risk Model Training Complete!")
        logger.info("=" * 60)
        logger.info(f"Model saved to: {IMPACT_RISK_MODEL_PATH}")
        logger.info(f"Overall accuracy: {metrics['overall_accuracy']:.4f}")
        
        if 'validation' in metrics:
            logger.info(f"Validation accuracy: {metrics['validation']['overall_accuracy']:.4f}")
        
        logger.info("\nPer-category performance:")
        metric_dict = metrics.get('validation', metrics) if 'validation' in metrics else metrics
        for category in ['satellites', 'gps', 'communication', 'power_grid']:
            if category in metric_dict:
                cat_metrics = metric_dict[category]
                logger.info(f"\n  {category.replace('_', ' ').title()}:")
                logger.info(f"    Accuracy:  {cat_metrics['accuracy']:.4f}")
                logger.info(f"    Precision: {cat_metrics['precision']:.4f}")
                logger.info(f"    Recall:    {cat_metrics['recall']:.4f}")
                logger.info(f"    F1:        {cat_metrics['f1']:.4f}")
        
        logger.info("\n" + "=" * 60)
        logger.info("You can now restart the backend server to load the model.")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"Error training model: {e}", exc_info=True)
        return False


if __name__ == "__main__":
    success = train_impact_model()
    sys.exit(0 if success else 1)
