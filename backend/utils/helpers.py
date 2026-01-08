"""
Utility functions and helpers for SolarGuard 3D
"""
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any


def risk_level(probability: float) -> str:
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


def categorize_severity(severity: float) -> str:
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


def get_impacts(severity: float) -> List[str]:
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


def calculate_visual_params(data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate parameters for 3D visualization"""
    return {
        'sun_glow_intensity': min(max(np.log10(data.get('xray_flux', 1e-8) + 1e-9) + 15, 0), 5),
        'cme_active': data.get('proton_flux', 0) > 10,
        'cme_speed': data.get('speed', 400) / 100,
        'magnetosphere_compression': 1 - (abs(data.get('bz', 0)) / 50) if data.get('bz', 0) < 0 else 1,
        'magnetosphere_color': '#ff0000' if data.get('bz', 0) < -5 else '#00ff88',
        'aurora_intensity': max(0, min(1, abs(data.get('bz', 0)) / 20)),
        'show_aurora': data.get('bz', 0) < -5 and data.get('speed', 0) > 500
    }


def generate_explanation(shap_values: np.ndarray, feature_names: List[str]) -> str:
    """Generate human-readable explanation from SHAP values"""
    # Get top 3 features
    abs_values = np.abs(shap_values)
    top_indices = np.argsort(abs_values)[-3:][::-1]
    
    explanations = []
    for idx in top_indices:
        feature = feature_names[idx]
        value = shap_values[idx]
        
        if 'bz' in feature.lower():
            if value < 0:
                explanations.append(f"Southward magnetic field (Bz) strongly indicates storm conditions")
            else:
                explanations.append(f"Northward magnetic field (Bz) reduces storm likelihood")
        elif 'speed' in feature.lower():
            if value > 0:
                explanations.append(f"High solar wind speed increases storm probability")
        elif 'proton' in feature.lower():
            if value > 0:
                explanations.append(f"Elevated proton flux suggests active solar conditions")
    
    return ". ".join(explanations) + "."


def prepare_features(data: Dict[str, Any], feature_list: List[str]) -> np.ndarray:
    """Prepare feature array from input data"""
    features = []
    for feature in feature_list:
        features.append(data.get(feature, 0))
    return np.array([features])


def validate_data(data: Dict[str, Any]) -> bool:
    """Validate input data"""
    required_fields = ['bz', 'speed', 'density']
    return all(field in data for field in required_fields)


def interpolate_missing(values: np.ndarray) -> np.ndarray:
    """Interpolate missing values in time series"""
    mask = np.isnan(values)
    if not mask.any():
        return values
    
    indices = np.arange(len(values))
    valid_indices = indices[~mask]
    valid_values = values[~mask]
    
    if len(valid_values) == 0:
        return np.zeros_like(values)
    
    interpolated = np.interp(indices, valid_indices, valid_values)
    return interpolated


def calculate_energy_coupling(speed: float, bz: float, clock_angle: float = 45) -> float:
    """
    Calculate energy coupling function
    Based on Newell et al. (2007) solar wind-magnetosphere coupling function
    """
    if bz >= 0:
        return 0
    
    sin_term = np.sin(np.radians(clock_angle / 2)) ** 4
    coupling = speed * (bz ** 2) * sin_term
    return abs(coupling)


def get_time_to_impact(speed: float) -> float:
    """
    Calculate estimated time for CME to reach Earth
    Distance: ~150 million km (1 AU)
    """
    EARTH_SUN_DISTANCE_KM = 1.496e8
    speed_km_per_hour = speed * 3600  # km/s to km/hr
    
    if speed_km_per_hour == 0:
        return 0
    
    hours = EARTH_SUN_DISTANCE_KM / speed_km_per_hour
    return hours


def format_timestamp(dt: datetime) -> str:
    """Format datetime for API responses"""
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")


def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse timestamp string to datetime"""
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S UTC"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(timestamp_str, fmt)
        except ValueError:
            continue
    
    raise ValueError(f"Unable to parse timestamp: {timestamp_str}")
