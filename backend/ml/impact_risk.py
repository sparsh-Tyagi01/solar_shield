"""
MODEL C: Impact Risk Classifier
Multi-label Random Forest classifier
Predicts which systems will be affected: satellites, GPS, communication, power grid
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from typing import Dict, Any, List
import joblib
from backend.utils.logger import get_logger
from backend.config import (
    IMPACT_FEATURES,
    IMPACT_CATEGORIES,
    IMPACT_RISK_MODEL_PATH,
    RANDOM_SEED
)

logger = get_logger(__name__)


class ImpactRiskClassifier:
    """
    MODEL C: Multi-label classifier for impact zones
    
    Question: What systems will be affected?
    Classes: Satellites, GPS, Communication, Power Grid
    Output: Risk probability for each system
    """
    
    def __init__(self):
        self.model = None
        self.features = IMPACT_FEATURES
        self.impact_categories = IMPACT_CATEGORIES
        self.n_categories = len(self.impact_categories)
        self.is_trained = False
    
    def build_model(self) -> MultiOutputClassifier:
        """Build Random Forest multi-output classifier"""
        logger.info("Building Random Forest model for impact classification")
        
        base_model = RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=RANDOM_SEED,
            n_jobs=-1
        )
        
        # Wrap in MultiOutputClassifier for multi-label prediction
        model = MultiOutputClassifier(base_model)
        
        return model
    
    def train(self, X_train: pd.DataFrame, y_train: pd.DataFrame,
              X_val: pd.DataFrame = None, y_val: pd.DataFrame = None) -> Dict[str, Any]:
        """
        Train the model
        
        Args:
            X_train: Training features
            y_train: Training labels (multi-label DataFrame)
            X_val: Validation features (optional)
            y_val: Validation labels (optional)
        
        Returns:
            Dictionary of training metrics
        """
        logger.info("Training impact risk classifier...")
        
        # Build model if not exists
        if self.model is None:
            self.model = self.build_model()
        
        # Select features and labels
        X_train_features = X_train[self.features]
        y_train_labels = y_train[self.impact_categories]
        
        # Train
        self.model.fit(X_train_features, y_train_labels)
        
        self.is_trained = True
        
        # Calculate metrics
        metrics = self.evaluate(X_train, y_train, "Training")
        
        if X_val is not None and y_val is not None:
            val_metrics = self.evaluate(X_val, y_val, "Validation")
            metrics['validation'] = val_metrics
        
        logger.info(f"Training complete. Overall accuracy: {metrics['overall_accuracy']:.4f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict impact categories (binary)
        
        Returns:
            Array of shape (n_samples, n_categories)
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        X_features = X[self.features]
        predictions = self.model.predict(X_features)
        
        return predictions
    
    def predict_proba(self, X: pd.DataFrame) -> Dict[str, np.ndarray]:
        """
        Predict impact probabilities for each category
        
        Returns:
            Dictionary mapping category -> probability array
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        X_features = X[self.features]
        
        # Get probabilities for each output
        probabilities = {}
        
        for idx, category in enumerate(self.impact_categories):
            # Each estimator in MultiOutputClassifier
            estimator = self.model.estimators_[idx]
            probs = estimator.predict_proba(X_features)
            
            # Get probability of positive class (column 1)
            if probs.shape[1] == 2:
                probabilities[category] = probs[:, 1]
            else:
                # If only one class seen during training
                probabilities[category] = np.zeros(len(X))
        
        return probabilities
    
    def evaluate(self, X: pd.DataFrame, y: pd.DataFrame,
                dataset_name: str = "Test") -> Dict[str, Any]:
        """
        Evaluate model performance
        
        Returns:
            Dictionary of metrics per category and overall
        """
        y_true = y[self.impact_categories].values
        y_pred = self.predict(X)
        
        # Overall metrics
        overall_accuracy = accuracy_score(y_true, y_pred)
        
        # Per-category metrics
        category_metrics = {}
        
        for idx, category in enumerate(self.impact_categories):
            y_true_cat = y_true[:, idx]
            y_pred_cat = y_pred[:, idx]
            
            category_metrics[category] = {
                'accuracy': accuracy_score(y_true_cat, y_pred_cat),
                'precision': precision_score(y_true_cat, y_pred_cat, zero_division=0),
                'recall': recall_score(y_true_cat, y_pred_cat, zero_division=0),
                'f1': f1_score(y_true_cat, y_pred_cat, zero_division=0)
            }
        
        logger.info(f"{dataset_name} Metrics:")
        logger.info(f"  Overall Accuracy: {overall_accuracy:.4f}")
        for category, metrics in category_metrics.items():
            logger.info(f"  {category}: F1={metrics['f1']:.4f}")
        
        return {
            'overall_accuracy': overall_accuracy,
            'category_metrics': category_metrics
        }
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get feature importance scores averaged across all categories"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained.")
        
        # Average importance across all estimators
        importances = []
        for estimator in self.model.estimators_:
            importances.append(estimator.feature_importances_)
        
        avg_importance = np.mean(importances, axis=0)
        
        importance_df = pd.DataFrame({
            'feature': self.features,
            'importance': avg_importance
        }).sort_values('importance', ascending=False)
        
        return importance_df
    
    def save(self, path: str = None):
        """Save model to disk"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained.")
        
        path = path or str(IMPACT_RISK_MODEL_PATH)
        joblib.dump({
            'model': self.model,
            'features': self.features,
            'impact_categories': self.impact_categories,
            'is_trained': self.is_trained
        }, path)
        
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str = None):
        """Load model from disk"""
        path = path or str(IMPACT_RISK_MODEL_PATH)
        
        data = joblib.load(path)
        self.model = data['model']
        self.features = data['features']
        self.impact_categories = data['impact_categories']
        self.is_trained = data['is_trained']
        
        logger.info(f"Model loaded from {path}")
    
    def predict_single(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict impacts for single data point
        
        Args:
            data: Dictionary with feature values
        
        Returns:
            Dictionary with impact predictions and risk levels
        """
        # Create DataFrame from single data point
        df = pd.DataFrame([data])
        
        # Ensure all features exist
        for feature in self.features:
            if feature not in df.columns:
                df[feature] = 0.0
        
        # Get probabilities
        probabilities = self.predict_proba(df)
        
        # Format results
        results = {}
        for category in self.impact_categories:
            prob = float(probabilities[category][0])
            results[category] = {
                'risk': prob,
                'status': self._get_risk_level(prob),
                'affected': prob > 0.5
            }
        
        return results
    
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
    
    def get_affected_systems(self, data: Dict[str, Any], threshold: float = 0.5) -> List[str]:
        """
        Get list of systems that will be affected
        
        Args:
            data: Feature dictionary
            threshold: Probability threshold for "affected"
        
        Returns:
            List of affected system names
        """
        prediction = self.predict_single(data)
        
        affected = [
            category for category, info in prediction.items()
            if info['risk'] >= threshold
        ]
        
        return affected
