"""
MODEL A: Storm Occurrence Predictor
Binary classifier using XGBoost
Predicts if geomagnetic storm will occur in next 12-24 hours
"""
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from typing import Tuple, Dict, Any
import joblib
from backend.utils.logger import get_logger
from backend.config import (
    OCCURRENCE_FEATURES, 
    STORM_OCCURRENCE_MODEL_PATH,
    RANDOM_SEED
)

logger = get_logger(__name__)


class StormOccurrencePredictor:
    """
    MODEL A: Binary classifier for storm occurrence
    
    Question: Will a geomagnetic storm occur in next 12–24 hrs?
    Input: IMF Bz, solar wind speed, density, gradients
    Output: Yes (1) / No (0) + Probability
    """
    
    def __init__(self):
        self.model = None
        self.features = OCCURRENCE_FEATURES
        self.is_trained = False
        
    def build_model(self) -> xgb.XGBClassifier:
        """Build XGBoost classifier"""
        logger.info("Building XGBoost model for storm occurrence prediction")
        
        model = xgb.XGBClassifier(
            max_depth=6,
            learning_rate=0.1,
            n_estimators=200,
            objective='binary:logistic',
            eval_metric='logloss',
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_SEED,
            use_label_encoder=False
        )
        
        return model
    
    def train(self, X_train: pd.DataFrame, y_train: pd.Series,
              X_val: pd.DataFrame = None, y_val: pd.Series = None) -> Dict[str, float]:
        """
        Train the model
        
        Args:
            X_train: Training features
            y_train: Training labels (binary)
            X_val: Validation features (optional)
            y_val: Validation labels (optional)
        
        Returns:
            Dictionary of training metrics
        """
        logger.info("Training storm occurrence predictor...")
        
        # Build model if not exists
        if self.model is None:
            self.model = self.build_model()
        
        # Select features
        X_train_features = X_train[self.features]
        
        # Prepare evaluation set
        eval_set = []
        if X_val is not None and y_val is not None:
            X_val_features = X_val[self.features]
            eval_set = [(X_val_features, y_val)]
        
        # Train
        self.model.fit(
            X_train_features,
            y_train,
            eval_set=eval_set if eval_set else None,
            verbose=False
        )
        
        self.is_trained = True
        
        # Calculate metrics
        metrics = self.evaluate(X_train, y_train, "Training")
        
        if X_val is not None and y_val is not None:
            val_metrics = self.evaluate(X_val, y_val, "Validation")
            metrics.update({f"val_{k}": v for k, v in val_metrics.items()})
        
        logger.info(f"Training complete. Accuracy: {metrics['accuracy']:.4f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict storm occurrence (binary)
        
        Returns:
            Array of predictions (0 or 1)
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        X_features = X[self.features]
        predictions = self.model.predict(X_features)
        
        return predictions
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict storm occurrence probability
        
        Returns:
            Array of probabilities for class 1 (storm)
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        X_features = X[self.features]
        probabilities = self.model.predict_proba(X_features)[:, 1]
        
        return probabilities
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series, 
                dataset_name: str = "Test") -> Dict[str, float]:
        """
        Evaluate model performance
        
        Returns:
            Dictionary of metrics
        """
        y_pred = self.predict(X)
        y_prob = self.predict_proba(X)
        
        metrics = {
            'accuracy': accuracy_score(y, y_pred),
            'precision': precision_score(y, y_pred, zero_division=0),
            'recall': recall_score(y, y_pred, zero_division=0),
            'f1': f1_score(y, y_pred, zero_division=0),
            'roc_auc': roc_auc_score(y, y_prob)
        }
        
        logger.info(f"{dataset_name} Metrics:")
        for metric, value in metrics.items():
            logger.info(f"  {metric}: {value:.4f}")
        
        return metrics
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get feature importance scores"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained.")
        
        importance_df = pd.DataFrame({
            'feature': self.features,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return importance_df
    
    def save(self, path: str = None):
        """Save model to disk"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained.")
        
        path = path or str(STORM_OCCURRENCE_MODEL_PATH)
        joblib.dump({
            'model': self.model,
            'features': self.features,
            'is_trained': self.is_trained
        }, path)
        
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str = None):
        """Load model from disk"""
        path = path or str(STORM_OCCURRENCE_MODEL_PATH)
        
        data = joblib.load(path)
        self.model = data['model']
        self.features = data['features']
        self.is_trained = data['is_trained']
        
        logger.info(f"Model loaded from {path}")
    
    def predict_single(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict for single data point
        
        Args:
            data: Dictionary with feature values
        
        Returns:
            Dictionary with prediction and probability
        """
        # Create DataFrame from single data point
        df = pd.DataFrame([data])
        
        # Ensure all features exist
        for feature in self.features:
            if feature not in df.columns:
                df[feature] = 0.0
        
        probability = self.predict_proba(df)[0]
        prediction = int(probability > 0.5)
        
        return {
            'will_storm_occur': bool(prediction),
            'probability': float(probability),
            'confidence': float(abs(probability - 0.5) * 2),
            'risk_level': self._get_risk_level(probability)
        }
    
    def _get_risk_level(self, probability: float) -> str:
        """Convert probability to risk level"""
        if probability >= 0.8:
            return "CRITICAL"
        elif probability >= 0.6:
            return "HIGH"
        elif probability >= 0.4:
            return "MODERATE"
        elif probability >= 0.2:
            return "LOW"
        else:
            return "MINIMAL"
