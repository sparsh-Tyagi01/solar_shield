"""
Model Improvement System
Auto-improve ML models based on actual vs predicted outcomes
Implements online learning and continuous model enhancement
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import joblib
import json
from backend.utils.logger import get_logger
from backend.config import MODEL_DIR, DATA_DIR

logger = get_logger(__name__)


class ModelImprover:
    """
    Continuous model improvement system
    
    Features:
    1. Track predictions and actual outcomes
    2. Calculate performance metrics
    3. Retrain models when performance degrades
    4. Online learning for real-time adaptation
    """
    
    def __init__(self, improvement_dir: Path = None):
        self.improvement_dir = improvement_dir or (DATA_DIR / "improvement")
        self.improvement_dir.mkdir(exist_ok=True)
        
        # Storage for prediction-outcome pairs
        self.prediction_log = {
            'storm_occurrence': [],
            'storm_severity': [],
            'impact_risk': []
        }
        
        # Performance tracking
        self.performance_history = {
            'storm_occurrence': {'accuracy': [], 'timestamps': []},
            'storm_severity': {'mae': [], 'rmse': [], 'timestamps': []},
            'impact_risk': {'accuracy': [], 'timestamps': []}
        }
        
        # Thresholds for retraining
        self.retrain_thresholds = {
            'storm_occurrence': {
                'min_samples': 50,
                'accuracy_drop': 0.15,  # 15% drop triggers retrain
                'baseline_accuracy': 0.85
            },
            'storm_severity': {
                'min_samples': 50,
                'mae_increase': 1.5,  # MAE increase by 1.5 triggers retrain
                'baseline_mae': 1.2
            },
            'impact_risk': {
                'min_samples': 50,
                'accuracy_drop': 0.15,
                'baseline_accuracy': 0.80
            }
        }
        
        # Load existing logs
        self._load_logs()
    
    def log_prediction(
        self,
        model_type: str,
        input_data: Dict[str, Any],
        prediction: Any,
        timestamp: datetime = None
    ) -> str:
        """
        Log a prediction for future comparison
        
        Args:
            model_type: Type of model ('storm_occurrence', 'storm_severity', 'impact_risk')
            input_data: Input features used for prediction
            prediction: Model prediction
            timestamp: Prediction timestamp
        
        Returns:
            Prediction ID for later reference
        """
        if timestamp is None:
            timestamp = datetime.utcnow()
        
        prediction_id = f"{model_type}_{timestamp.strftime('%Y%m%d_%H%M%S')}"
        
        log_entry = {
            'id': prediction_id,
            'timestamp': timestamp.isoformat(),
            'input_data': input_data,
            'prediction': prediction,
            'actual': None,  # To be filled later
            'recorded': False
        }
        
        self.prediction_log[model_type].append(log_entry)
        
        # Save to disk
        self._save_logs()
        
        logger.info(f"Logged prediction {prediction_id}")
        return prediction_id
    
    def record_actual_outcome(
        self,
        prediction_id: str,
        actual_outcome: Any
    ) -> bool:
        """
        Record actual outcome for a previous prediction
        
        Args:
            prediction_id: ID from log_prediction
            actual_outcome: Actual observed outcome
        
        Returns:
            True if recorded successfully
        """
        # Find prediction in logs
        model_type = prediction_id.split('_')[0] + '_' + prediction_id.split('_')[1]
        
        for entry in self.prediction_log.get(model_type, []):
            if entry['id'] == prediction_id and not entry['recorded']:
                entry['actual'] = actual_outcome
                entry['recorded'] = True
                entry['recorded_at'] = datetime.utcnow().isoformat()
                
                # Update performance metrics
                self._update_performance_metrics(model_type, entry)
                
                # Check if retraining needed
                self._check_retrain_needed(model_type)
                
                # Save to disk
                self._save_logs()
                
                logger.info(f"Recorded actual outcome for {prediction_id}")
                return True
        
        logger.warning(f"Prediction {prediction_id} not found or already recorded")
        return False
    
    def _update_performance_metrics(
        self,
        model_type: str,
        entry: Dict[str, Any]
    ):
        """Update performance metrics based on new actual outcome"""
        predicted = entry['prediction']
        actual = entry['actual']
        timestamp = entry['timestamp']
        
        if model_type == 'storm_occurrence':
            # Binary classification
            correct = (predicted == actual)
            self.performance_history['storm_occurrence']['accuracy'].append(1.0 if correct else 0.0)
            self.performance_history['storm_occurrence']['timestamps'].append(timestamp)
        
        elif model_type == 'storm_severity':
            # Regression
            mae = abs(predicted - actual)
            rmse = (predicted - actual) ** 2
            self.performance_history['storm_severity']['mae'].append(mae)
            self.performance_history['storm_severity']['rmse'].append(rmse)
            self.performance_history['storm_severity']['timestamps'].append(timestamp)
        
        elif model_type == 'impact_risk':
            # Multi-label classification
            if isinstance(predicted, dict) and isinstance(actual, dict):
                correct_predictions = sum(
                    1 for k in predicted if predicted.get(k) == actual.get(k)
                )
                accuracy = correct_predictions / len(predicted)
                self.performance_history['impact_risk']['accuracy'].append(accuracy)
                self.performance_history['impact_risk']['timestamps'].append(timestamp)
    
    def _check_retrain_needed(self, model_type: str) -> bool:
        """Check if model needs retraining based on performance"""
        threshold_config = self.retrain_thresholds[model_type]
        
        if model_type == 'storm_occurrence':
            recent_accuracy = self.get_recent_performance(model_type, window_size=50)
            if recent_accuracy is None:
                return False
            
            min_samples = threshold_config['min_samples']
            accuracy_drop = threshold_config['accuracy_drop']
            baseline = threshold_config['baseline_accuracy']
            
            if len(self.performance_history['storm_occurrence']['accuracy']) >= min_samples:
                if recent_accuracy < (baseline - accuracy_drop):
                    logger.warning(
                        f"Storm occurrence model performance degraded: "
                        f"{recent_accuracy:.3f} < {baseline - accuracy_drop:.3f}"
                    )
                    self._trigger_retrain(model_type)
                    return True
        
        elif model_type == 'storm_severity':
            recent_mae = self.get_recent_performance(model_type, window_size=50)
            if recent_mae is None:
                return False
            
            min_samples = threshold_config['min_samples']
            mae_increase = threshold_config['mae_increase']
            baseline = threshold_config['baseline_mae']
            
            if len(self.performance_history['storm_severity']['mae']) >= min_samples:
                if recent_mae > (baseline + mae_increase):
                    logger.warning(
                        f"Storm severity model performance degraded: "
                        f"MAE {recent_mae:.3f} > {baseline + mae_increase:.3f}"
                    )
                    self._trigger_retrain(model_type)
                    return True
        
        elif model_type == 'impact_risk':
            recent_accuracy = self.get_recent_performance(model_type, window_size=50)
            if recent_accuracy is None:
                return False
            
            min_samples = threshold_config['min_samples']
            accuracy_drop = threshold_config['accuracy_drop']
            baseline = threshold_config['baseline_accuracy']
            
            if len(self.performance_history['impact_risk']['accuracy']) >= min_samples:
                if recent_accuracy < (baseline - accuracy_drop):
                    logger.warning(
                        f"Impact risk model performance degraded: "
                        f"{recent_accuracy:.3f} < {baseline - accuracy_drop:.3f}"
                    )
                    self._trigger_retrain(model_type)
                    return True
        
        return False
    
    def _trigger_retrain(self, model_type: str):
        """Trigger model retraining"""
        logger.info(f"Triggering retraining for {model_type} model")
        
        # Save retraining request
        retrain_request = {
            'model_type': model_type,
            'timestamp': datetime.utcnow().isoformat(),
            'reason': 'performance_degradation',
            'status': 'pending'
        }
        
        retrain_file = self.improvement_dir / f"retrain_{model_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        with open(retrain_file, 'w') as f:
            json.dump(retrain_request, f, indent=2)
        
        logger.info(f"Retraining request saved to {retrain_file}")
    
    def get_recent_performance(
        self,
        model_type: str,
        window_size: int = 50
    ) -> Optional[float]:
        """Get recent performance metrics"""
        if model_type == 'storm_occurrence':
            accuracy_list = self.performance_history['storm_occurrence']['accuracy']
            if len(accuracy_list) == 0:
                return None
            recent = accuracy_list[-window_size:]
            return np.mean(recent)
        
        elif model_type == 'storm_severity':
            mae_list = self.performance_history['storm_severity']['mae']
            if len(mae_list) == 0:
                return None
            recent = mae_list[-window_size:]
            return np.mean(recent)
        
        elif model_type == 'impact_risk':
            accuracy_list = self.performance_history['impact_risk']['accuracy']
            if len(accuracy_list) == 0:
                return None
            recent = accuracy_list[-window_size:]
            return np.mean(recent)
        
        return None
    
    def get_improvement_summary(self) -> Dict[str, Any]:
        """Get summary of model improvement status"""
        summary = {}
        
        for model_type in ['storm_occurrence', 'storm_severity', 'impact_risk']:
            logged = len([e for e in self.prediction_log[model_type] if not e['recorded']])
            recorded = len([e for e in self.prediction_log[model_type] if e['recorded']])
            
            recent_perf = self.get_recent_performance(model_type)
            
            summary[model_type] = {
                'predictions_logged': logged + recorded,
                'outcomes_recorded': recorded,
                'pending_outcomes': logged,
                'recent_performance': recent_perf,
                'total_history_size': len(self.performance_history[model_type].get('accuracy', 
                                        self.performance_history[model_type].get('mae', [])))
            }
        
        return summary
    
    def export_training_data(self, model_type: str) -> Optional[Tuple[pd.DataFrame, pd.Series]]:
        """
        Export new training data from recorded predictions
        
        Args:
            model_type: Type of model
        
        Returns:
            Tuple of (X, y) DataFrames for retraining
        """
        recorded_entries = [
            e for e in self.prediction_log[model_type]
            if e['recorded']
        ]
        
        if len(recorded_entries) < 10:
            logger.warning(f"Not enough data for {model_type}: {len(recorded_entries)} samples")
            return None
        
        # Convert to DataFrame
        X_data = []
        y_data = []
        
        for entry in recorded_entries:
            X_data.append(entry['input_data'])
            y_data.append(entry['actual'])
        
        X_df = pd.DataFrame(X_data)
        y_series = pd.Series(y_data)
        
        logger.info(f"Exported {len(X_df)} samples for {model_type} retraining")
        return X_df, y_series
    
    def _save_logs(self):
        """Save logs to disk"""
        try:
            log_file = self.improvement_dir / "prediction_logs.pkl"
            joblib.dump(self.prediction_log, log_file)
            
            perf_file = self.improvement_dir / "performance_history.pkl"
            joblib.dump(self.performance_history, perf_file)
        except Exception as e:
            logger.error(f"Error saving logs: {e}")
    
    def _load_logs(self):
        """Load logs from disk"""
        try:
            log_file = self.improvement_dir / "prediction_logs.pkl"
            if log_file.exists():
                self.prediction_log = joblib.load(log_file)
                logger.info("Loaded prediction logs")
            
            perf_file = self.improvement_dir / "performance_history.pkl"
            if perf_file.exists():
                self.performance_history = joblib.load(perf_file)
                logger.info("Loaded performance history")
        except Exception as e:
            logger.error(f"Error loading logs: {e}")


# Global instance
_model_improver = None


def get_model_improver() -> ModelImprover:
    """Get global model improver instance"""
    global _model_improver
    if _model_improver is None:
        _model_improver = ModelImprover()
    return _model_improver
