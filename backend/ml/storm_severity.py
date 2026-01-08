"""
MODEL B: Storm Severity Predictor
LSTM model for time-series severity prediction
Predicts storm severity on 0-10 scale
"""
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from typing import Tuple, Dict, Any
from backend.utils.logger import get_logger
from backend.config import (
    SEVERITY_FEATURES,
    STORM_SEVERITY_MODEL_PATH,
    SEQUENCE_LENGTH,
    RANDOM_SEED
)

logger = get_logger(__name__)

# Set random seeds for reproducibility
np.random.seed(RANDOM_SEED)
tf.random.set_seed(RANDOM_SEED)


class StormSeverityPredictor:
    """
    MODEL B: LSTM for severity regression
    
    Question: How severe will the storm be?
    Input: Time-series of solar wind parameters (60-minute sequences)
    Output: Severity score (0–10)
    """
    
    def __init__(self, sequence_length: int = SEQUENCE_LENGTH):
        self.model = None
        self.sequence_length = sequence_length
        self.features = SEVERITY_FEATURES
        self.n_features = len(self.features)
        self.is_trained = False
        self.scaler_mean = None
        self.scaler_std = None
    
    def build_model(self) -> keras.Model:
        """Build LSTM model"""
        logger.info(f"Building LSTM model with sequence length {self.sequence_length}")
        
        model = keras.Sequential([
            layers.Input(shape=(self.sequence_length, self.n_features)),
            
            # First LSTM layer with return sequences
            layers.LSTM(64, return_sequences=True, activation='tanh'),
            layers.Dropout(0.2),
            
            # Second LSTM layer
            layers.LSTM(32, activation='tanh'),
            layers.Dropout(0.2),
            
            # Dense layers
            layers.Dense(16, activation='relu'),
            layers.Dense(8, activation='relu'),
            
            # Output layer (0-10 scale)
            layers.Dense(1, activation='linear')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae', 'mse']
        )
        
        logger.info(f"Model built with {model.count_params()} parameters")
        
        return model
    
    def normalize_features(self, X: np.ndarray, fit: bool = False) -> np.ndarray:
        """Normalize features using z-score normalization"""
        if fit:
            # Calculate mean and std across all samples and timesteps
            self.scaler_mean = np.mean(X, axis=(0, 1))
            self.scaler_std = np.std(X, axis=(0, 1)) + 1e-8
            logger.info("Feature normalization parameters computed")
        
        if self.scaler_mean is None or self.scaler_std is None:
            raise ValueError("Scaler not fitted. Set fit=True first.")
        
        # Normalize
        X_normalized = (X - self.scaler_mean) / self.scaler_std
        
        return X_normalized
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray,
              X_val: np.ndarray = None, y_val: np.ndarray = None,
              epochs: int = 50, batch_size: int = 32) -> Dict[str, Any]:
        """
        Train the LSTM model
        
        Args:
            X_train: Training sequences (samples, timesteps, features)
            y_train: Training targets (samples,)
            X_val: Validation sequences (optional)
            y_val: Validation targets (optional)
            epochs: Number of training epochs
            batch_size: Batch size
        
        Returns:
            Training history
        """
        logger.info(f"Training storm severity predictor...")
        logger.info(f"Training data shape: {X_train.shape}")
        
        # Build model if not exists
        if self.model is None:
            self.model = self.build_model()
        
        # Normalize features
        X_train_norm = self.normalize_features(X_train, fit=True)
        
        # Prepare validation data
        validation_data = None
        if X_val is not None and y_val is not None:
            X_val_norm = self.normalize_features(X_val, fit=False)
            validation_data = (X_val_norm, y_val)
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss' if validation_data else 'loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss' if validation_data else 'loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6
            )
        ]
        
        # Train
        history = self.model.fit(
            X_train_norm,
            y_train,
            validation_data=validation_data,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        self.is_trained = True
        
        # Calculate final metrics
        metrics = self.evaluate(X_train, y_train, "Training")
        
        if X_val is not None and y_val is not None:
            val_metrics = self.evaluate(X_val, y_val, "Validation")
            metrics.update({f"val_{k}": v for k, v in val_metrics.items()})
        
        logger.info(f"Training complete. MAE: {metrics['mae']:.4f}")
        
        return {
            'history': history.history,
            'metrics': metrics
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict storm severity
        
        Args:
            X: Sequences (samples, timesteps, features)
        
        Returns:
            Array of severity scores (0-10)
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Normalize
        X_norm = self.normalize_features(X, fit=False)
        
        # Predict
        predictions = self.model.predict(X_norm, verbose=0)
        
        # Clip to valid range [0, 10]
        predictions = np.clip(predictions.flatten(), 0, 10)
        
        return predictions
    
    def evaluate(self, X: np.ndarray, y: np.ndarray,
                dataset_name: str = "Test") -> Dict[str, float]:
        """
        Evaluate model performance
        
        Returns:
            Dictionary of metrics
        """
        y_pred = self.predict(X)
        
        metrics = {
            'mae': mean_absolute_error(y, y_pred),
            'rmse': np.sqrt(mean_squared_error(y, y_pred)),
            'r2': r2_score(y, y_pred)
        }
        
        logger.info(f"{dataset_name} Metrics:")
        for metric, value in metrics.items():
            logger.info(f"  {metric}: {value:.4f}")
        
        return metrics
    
    def save(self, path: str = None):
        """Save model to disk"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained.")
        
        path = path or str(STORM_SEVERITY_MODEL_PATH)
        
        # Save Keras model
        self.model.save(path)
        
        # Save additional metadata
        import joblib
        meta_path = str(path).replace('.h5', '_meta.pkl')
        joblib.dump({
            'features': self.features,
            'sequence_length': self.sequence_length,
            'n_features': self.n_features,
            'scaler_mean': self.scaler_mean,
            'scaler_std': self.scaler_std,
            'is_trained': self.is_trained
        }, meta_path)
        
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str = None):
        """Load model from disk"""
        path = path or str(STORM_SEVERITY_MODEL_PATH)
        
        # Load Keras model with custom objects to handle metric deserialization
        self.model = keras.models.load_model(
            path,
            custom_objects={'mse': keras.metrics.MeanSquaredError()}
        )
        
        # Load metadata
        import joblib
        meta_path = str(path).replace('.h5', '_meta.pkl')
        meta = joblib.load(meta_path)
        
        self.features = meta['features']
        self.sequence_length = meta['sequence_length']
        self.n_features = meta['n_features']
        self.scaler_mean = meta['scaler_mean']
        self.scaler_std = meta['scaler_std']
        self.is_trained = meta['is_trained']
        
        logger.info(f"Model loaded from {path}")
    
    def predict_single_sequence(self, sequence: np.ndarray) -> Dict[str, Any]:
        """
        Predict severity for a single sequence
        
        Args:
            sequence: Array of shape (timesteps, features)
        
        Returns:
            Dictionary with prediction details
        """
        # Reshape to (1, timesteps, features)
        if sequence.ndim == 2:
            sequence = sequence.reshape(1, sequence.shape[0], sequence.shape[1])
        
        severity = self.predict(sequence)[0]
        
        return {
            'severity_score': float(severity),
            'category': self._categorize_severity(severity),
            'expected_impacts': self._get_impacts(severity)
        }
    
    def _categorize_severity(self, severity: float) -> str:
        """Categorize storm severity"""
        if severity >= 8:
            return "EXTREME"
        elif severity >= 6:
            return "SEVERE"
        elif severity >= 4:
            return "MODERATE"
        elif severity >= 2:
            return "MINOR"
        else:
            return "QUIET"
    
    def _get_impacts(self, severity: float) -> list:
        """Get expected impacts based on severity"""
        impacts = []
        
        if severity >= 2:
            impacts.append("Minor satellite operations impact")
        if severity >= 4:
            impacts.append("GPS accuracy degradation")
            impacts.append("Radio communication interference")
        if severity >= 6:
            impacts.append("Satellite orientation issues")
            impacts.append("HF radio propagation fade")
        if severity >= 8:
            impacts.append("Satellite surface charging")
            impacts.append("Power grid voltage irregularities")
            impacts.append("Complete HF radio blackout")
        
        return impacts if impacts else ["No significant impacts expected"]
