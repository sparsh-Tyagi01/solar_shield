"""
Confidence Score Calculator
Calculate prediction reliability scores for ML models
"""
import numpy as np
from typing import Dict, Any, Optional
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class ConfidenceCalculator:
    """
    Calculate confidence scores for predictions
    
    Factors considered:
    1. Model uncertainty (prediction probability/variance)
    2. Input data quality
    3. Historical model performance
    4. Feature completeness
    """
    
    def __init__(self):
        self.history = {
            'storm_occurrence': {'correct': 0, 'total': 0},
            'storm_severity': {'mae': [], 'rmse': []},
            'impact_risk': {'correct': 0, 'total': 0}
        }
    
    def calculate_occurrence_confidence(
        self, 
        probability: float,
        input_quality: float = 1.0,
        historical_accuracy: Optional[float] = None
    ) -> float:
        """
        Calculate confidence for storm occurrence prediction
        
        Args:
            probability: Model prediction probability (0-1)
            input_quality: Quality of input data (0-1)
            historical_accuracy: Recent model accuracy (0-1)
        
        Returns:
            Confidence score (0-100%)
        """
        # Base confidence from probability distribution
        # High confidence when probability is near 0 or 1
        prob_confidence = abs(probability - 0.5) * 2
        
        # Input quality factor
        quality_factor = input_quality
        
        # Historical performance factor
        if historical_accuracy is None:
            if self.history['storm_occurrence']['total'] > 0:
                historical_accuracy = (
                    self.history['storm_occurrence']['correct'] / 
                    self.history['storm_occurrence']['total']
                )
            else:
                historical_accuracy = 0.85  # Default baseline
        
        # Weighted combination
        confidence = (
            0.5 * prob_confidence +
            0.2 * quality_factor +
            0.3 * historical_accuracy
        ) * 100
        
        return round(min(max(confidence, 0), 100), 2)
    
    def calculate_severity_confidence(
        self,
        prediction_variance: float,
        input_quality: float = 1.0,
        historical_mae: Optional[float] = None
    ) -> float:
        """
        Calculate confidence for storm severity prediction
        
        Args:
            prediction_variance: Model prediction variance
            input_quality: Quality of input data (0-1)
            historical_mae: Recent mean absolute error
        
        Returns:
            Confidence score (0-100%)
        """
        # Base confidence from prediction variance (lower is better)
        # Assume variance typically ranges 0-2 for severity 0-10
        variance_confidence = 1 - min(prediction_variance / 2.0, 1.0)
        
        # Input quality factor
        quality_factor = input_quality
        
        # Historical performance factor
        if historical_mae is None:
            if len(self.history['storm_severity']['mae']) > 0:
                historical_mae = np.mean(self.history['storm_severity']['mae'][-10:])
            else:
                historical_mae = 1.0  # Default baseline
        
        # Convert MAE to confidence (lower MAE = higher confidence)
        # Assume MAE typically ranges 0-3 for severity 0-10
        mae_confidence = 1 - min(historical_mae / 3.0, 1.0)
        
        # Weighted combination
        confidence = (
            0.5 * variance_confidence +
            0.2 * quality_factor +
            0.3 * mae_confidence
        ) * 100
        
        return round(min(max(confidence, 0), 100), 2)
    
    def calculate_impact_confidence(
        self,
        probabilities: Dict[str, float],
        input_quality: float = 1.0,
        historical_accuracy: Optional[float] = None
    ) -> Dict[str, float]:
        """
        Calculate confidence for impact risk predictions
        
        Args:
            probabilities: Risk probabilities for each system
            input_quality: Quality of input data (0-1)
            historical_accuracy: Recent model accuracy (0-1)
        
        Returns:
            Dict of confidence scores for each system
        """
        if historical_accuracy is None:
            if self.history['impact_risk']['total'] > 0:
                historical_accuracy = (
                    self.history['impact_risk']['correct'] / 
                    self.history['impact_risk']['total']
                )
            else:
                historical_accuracy = 0.80  # Default baseline
        
        confidences = {}
        for system, prob in probabilities.items():
            # High confidence when probability is near 0 or 1
            prob_confidence = abs(prob - 0.5) * 2
            
            # Weighted combination
            confidence = (
                0.5 * prob_confidence +
                0.2 * input_quality +
                0.3 * historical_accuracy
            ) * 100
            
            confidences[system] = round(min(max(confidence, 0), 100), 2)
        
        return confidences
    
    def assess_input_quality(self, data: Dict[str, Any]) -> float:
        """
        Assess quality of input data
        
        Args:
            data: Input data dictionary
        
        Returns:
            Quality score (0-1)
        """
        required_fields = ['bz', 'speed', 'density']
        optional_fields = ['pressure', 'xray_flux', 'proton_flux']
        
        # Check required fields
        completeness_score = sum(
            1 for field in required_fields 
            if field in data and data[field] is not None
        ) / len(required_fields)
        
        # Check optional fields
        optional_score = sum(
            1 for field in optional_fields 
            if field in data and data[field] is not None
        ) / len(optional_fields)
        
        # Check value ranges (basic sanity check)
        range_valid = 1.0
        if 'speed' in data and data['speed'] is not None:
            if not (200 <= data['speed'] <= 1000):
                range_valid *= 0.8
        
        if 'bz' in data and data['bz'] is not None:
            if not (-50 <= data['bz'] <= 50):
                range_valid *= 0.8
        
        # Weighted combination
        quality = (
            0.6 * completeness_score +
            0.2 * optional_score +
            0.2 * range_valid
        )
        
        return round(quality, 3)
    
    def update_history(
        self,
        model_type: str,
        predicted: Any,
        actual: Any
    ):
        """
        Update historical performance tracking
        
        Args:
            model_type: 'storm_occurrence', 'storm_severity', or 'impact_risk'
            predicted: Predicted value
            actual: Actual observed value
        """
        try:
            if model_type == 'storm_occurrence':
                self.history['storm_occurrence']['total'] += 1
                if predicted == actual:
                    self.history['storm_occurrence']['correct'] += 1
            
            elif model_type == 'storm_severity':
                mae = abs(predicted - actual)
                self.history['storm_severity']['mae'].append(mae)
                rmse = (predicted - actual) ** 2
                self.history['storm_severity']['rmse'].append(rmse)
                
                # Keep only recent history
                if len(self.history['storm_severity']['mae']) > 100:
                    self.history['storm_severity']['mae'] = (
                        self.history['storm_severity']['mae'][-100:]
                    )
                    self.history['storm_severity']['rmse'] = (
                        self.history['storm_severity']['rmse'][-100:]
                    )
            
            elif model_type == 'impact_risk':
                self.history['impact_risk']['total'] += 1
                # Assuming predicted and actual are dicts with same keys
                if isinstance(predicted, dict) and isinstance(actual, dict):
                    correct = sum(
                        1 for k in predicted 
                        if predicted.get(k) == actual.get(k)
                    ) / len(predicted)
                    if correct > 0.75:  # At least 75% correct
                        self.history['impact_risk']['correct'] += 1
            
            logger.info(f"Updated {model_type} history")
        
        except Exception as e:
            logger.error(f"Error updating history: {e}")
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get summary of model performance"""
        summary = {}
        
        # Storm occurrence
        if self.history['storm_occurrence']['total'] > 0:
            summary['storm_occurrence_accuracy'] = (
                self.history['storm_occurrence']['correct'] / 
                self.history['storm_occurrence']['total']
            )
        
        # Storm severity
        if len(self.history['storm_severity']['mae']) > 0:
            summary['storm_severity_mae'] = np.mean(
                self.history['storm_severity']['mae']
            )
            summary['storm_severity_rmse'] = np.sqrt(np.mean(
                self.history['storm_severity']['rmse']
            ))
        
        # Impact risk
        if self.history['impact_risk']['total'] > 0:
            summary['impact_risk_accuracy'] = (
                self.history['impact_risk']['correct'] / 
                self.history['impact_risk']['total']
            )
        
        return summary


# Global instance
_confidence_calculator = None


def get_confidence_calculator() -> ConfidenceCalculator:
    """Get global confidence calculator instance"""
    global _confidence_calculator
    if _confidence_calculator is None:
        _confidence_calculator = ConfidenceCalculator()
    return _confidence_calculator
