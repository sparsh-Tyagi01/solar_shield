"""
Feature Engineering for Space Weather Prediction
Physics-based features for storm prediction
"""
import pandas as pd
import numpy as np
from typing import Optional
from backend.utils.logger import get_logger
from backend.config import ROLLING_WINDOW_30, ROLLING_WINDOW_60, STORM_SYM_H_THRESHOLD

logger = get_logger(__name__)


class FeatureEngineer:
    """Physics-based feature engineering for storm prediction"""
    
    def __init__(self):
        self.rolling_30 = ROLLING_WINDOW_30
        self.rolling_60 = ROLLING_WINDOW_60
        self.storm_threshold = STORM_SYM_H_THRESHOLD
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create comprehensive feature set from raw data
        
        Args:
            df: DataFrame with columns: timestamp, bz, speed, density, pressure, sym_h, xray_flux, proton_flux
        
        Returns:
            DataFrame with engineered features
        """
        logger.info("Creating features from raw data")
        
        df = df.copy()
        
        # Ensure timestamp is datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
        
        # Sort by timestamp
        df.sort_index(inplace=True)
        
        # Rolling Features (Energy Buildup)
        logger.info("Creating rolling features...")
        df['bz_rolling_30min'] = df['bz'].rolling(window=self.rolling_30, min_periods=1).mean()
        df['bz_rolling_60min'] = df['bz'].rolling(window=self.rolling_60, min_periods=1).mean()
        df['bz_std_30min'] = df['bz'].rolling(window=self.rolling_30, min_periods=1).std()
        
        df['speed_rolling_mean'] = df['speed'].rolling(window=self.rolling_30, min_periods=1).mean()
        df['speed_rolling_max'] = df['speed'].rolling(window=self.rolling_60, min_periods=1).max()
        
        df['density_rolling_mean'] = df['density'].rolling(window=self.rolling_30, min_periods=1).mean()
        
        df['proton_cumulative'] = df['proton_flux'].rolling(window=self.rolling_60, min_periods=1).sum()
        df['proton_rolling_max'] = df['proton_flux'].rolling(window=self.rolling_30, min_periods=1).max()
        
        df['xray_rolling_max'] = df['xray_flux'].rolling(window=self.rolling_30, min_periods=1).max()
        
        # Gradient Features (Shock Detection)
        logger.info("Creating gradient features...")
        df['bz_gradient'] = df['bz'].diff().fillna(0)
        df['bz_abs_gradient'] = df['bz_gradient'].abs()
        
        df['speed_gradient'] = df['speed'].diff().fillna(0)
        df['proton_gradient'] = df['proton_flux'].diff().fillna(0)
        df['pressure_spike'] = df['pressure'].diff().abs().fillna(0)
        
        # Interaction Terms (Physics-based)
        logger.info("Creating interaction features...")
        df['energy_coupling'] = self._calculate_energy_coupling(df['speed'], df['bz'])
        df['ram_pressure'] = 1.67e-6 * df['density'] * df['speed']**2
        
        # Minimum values (for storm characterization)
        df['bz_min_60min'] = df['bz'].rolling(window=self.rolling_60, min_periods=1).min()
        
        # Southward Bz duration
        df['bz_negative'] = (df['bz'] < 0).astype(int)
        df['bz_negative_duration'] = df['bz_negative'].rolling(window=self.rolling_60, min_periods=1).sum()
        
        # Storm phase indicator
        df['in_storm'] = (df['sym_h'] < self.storm_threshold).astype(int)
        
        # Clean up infinities and NaNs
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df.fillna(method='ffill', inplace=True)
        df.fillna(0, inplace=True)
        
        logger.info(f"Feature engineering complete. Shape: {df.shape}")
        
        return df
    
    def create_labels(self, df: pd.DataFrame, look_ahead_hours: int = 12) -> pd.DataFrame:
        """
        Create target labels for supervised learning
        
        Args:
            df: DataFrame with sym_h column
            look_ahead_hours: Hours to look ahead for storm prediction
        
        Returns:
            DataFrame with labels
        """
        logger.info(f"Creating labels with {look_ahead_hours}h look-ahead")
        
        df = df.copy()
        
        # Label 1: Storm Occurrence (binary)
        # Look ahead to see if storm occurs in next N hours
        look_ahead_minutes = look_ahead_hours * 60
        df['storm_occurrence'] = df['sym_h'].rolling(
            window=look_ahead_minutes, 
            min_periods=1
        ).min().shift(-look_ahead_minutes) < self.storm_threshold
        df['storm_occurrence'] = df['storm_occurrence'].astype(int)
        
        # Label 2: Storm Severity (0-10 scale)
        df['storm_severity'] = self._calculate_severity(df['sym_h'])
        
        # For training, we want to predict future severity
        df['future_severity'] = df['storm_severity'].shift(-look_ahead_minutes)
        
        # Label 3: Storm Duration (minutes)
        df['storm_duration'] = self._calculate_storm_duration(df['sym_h'])
        
        # Clean up
        df['storm_occurrence'].fillna(0, inplace=True)
        df['future_severity'].fillna(0, inplace=True)
        df['storm_duration'].fillna(0, inplace=True)
        
        logger.info("Labels created successfully")
        
        return df
    
    def create_impact_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create multi-label targets for impact classification
        
        Based on storm severity and characteristics:
        - Satellites: affected by high proton flux
        - GPS: affected by ionospheric disturbances
        - Communication: affected by radio blackouts
        - Power Grid: affected by severe geomagnetic disturbances
        """
        logger.info("Creating impact labels...")
        
        df = df.copy()
        
        # Satellites risk: high proton flux + moderate storm
        df['impact_satellites'] = (
            (df['proton_flux'] > 10) & 
            (df['storm_severity'] >= 4)
        ).astype(int)
        
        # GPS risk: moderate storm + high speed
        df['impact_gps'] = (
            (df['storm_severity'] >= 3) & 
            (df['speed'] > 500)
        ).astype(int)
        
        # Communication risk: X-ray flux + storm
        df['impact_communication'] = (
            (df['xray_flux'] > 1e-5) | 
            (df['storm_severity'] >= 4)
        ).astype(int)
        
        # Power grid risk: severe storm
        df['impact_power_grid'] = (
            df['storm_severity'] >= 6
        ).astype(int)
        
        logger.info("Impact labels created")
        
        return df
    
    def _calculate_energy_coupling(self, speed: pd.Series, bz: pd.Series) -> pd.Series:
        """
        Calculate energy coupling function
        Based on Newell et al. (2007)
        """
        # Only couple when Bz is southward
        bz_south = bz.clip(upper=0)
        
        # Clock angle assumed at 45 degrees for simplification
        sin_term = np.sin(np.radians(45) / 2) ** 4
        
        coupling = speed * (bz_south ** 2) * sin_term
        return coupling.abs()
    
    def _calculate_severity(self, sym_h: pd.Series) -> pd.Series:
        """
        Map SYM-H to 0-10 severity scale
        
        SYM-H ranges:
        0 to -50: Minor (0-3)
        -50 to -100: Moderate (3-5)
        -100 to -200: Severe (5-8)
        < -200: Extreme (8-10)
        """
        severity = (-sym_h / 20).clip(0, 10)
        return severity
    
    def _calculate_storm_duration(self, sym_h: pd.Series) -> pd.Series:
        """Calculate duration of current storm in minutes"""
        in_storm = (sym_h < self.storm_threshold).astype(int)
        
        # Calculate consecutive storm minutes
        duration = pd.Series(0, index=sym_h.index)
        count = 0
        
        for i in range(len(in_storm)):
            if in_storm.iloc[i] == 1:
                count += 1
                duration.iloc[i] = count
            else:
                count = 0
        
        return duration
    
    def prepare_sequences(self, df: pd.DataFrame, sequence_length: int, 
                         features: list, target: str = 'future_severity') -> tuple:
        """
        Prepare sequential data for LSTM
        
        Args:
            df: DataFrame with features
            sequence_length: Length of sequences (timesteps)
            features: List of feature columns
            target: Target column name
        
        Returns:
            (X_sequences, y_targets, valid_indices)
        """
        logger.info(f"Preparing sequences of length {sequence_length}")
        
        # Extract feature matrix
        X = df[features].values
        y = df[target].values
        
        sequences = []
        targets = []
        valid_indices = []
        
        for i in range(sequence_length, len(X)):
            sequences.append(X[i-sequence_length:i])
            targets.append(y[i])
            valid_indices.append(i)
        
        X_seq = np.array(sequences)
        y_seq = np.array(targets)
        
        logger.info(f"Created {len(sequences)} sequences")
        
        return X_seq, y_seq, valid_indices
    
    def create_realtime_features(self, data: dict) -> pd.DataFrame:
        """
        Create features from real-time data point
        Note: For real-time, we need historical context
        """
        # Convert single data point to DataFrame
        df = pd.DataFrame([data])
        
        # For real-time, we'd normally have a rolling buffer
        # For now, use current values as rolling values
        df['bz_rolling_30min'] = df['bz']
        df['bz_rolling_60min'] = df['bz']
        df['speed_rolling_mean'] = df['speed']
        df['proton_cumulative'] = df['proton_flux']
        df['energy_coupling'] = self._calculate_energy_coupling(df['speed'], df['bz'])
        df['bz_gradient'] = 0  # Can't calculate without history
        df['pressure_spike'] = 0
        
        return df


def engineer_features(df: pd.DataFrame, create_labels: bool = True, 
                     look_ahead_hours: int = 12) -> pd.DataFrame:
    """
    Convenience function for feature engineering
    
    Args:
        df: Raw data DataFrame
        create_labels: Whether to create target labels
        look_ahead_hours: Hours to look ahead for predictions
    
    Returns:
        Engineered DataFrame
    """
    engineer = FeatureEngineer()
    
    # Create features
    df_features = engineer.create_features(df)
    
    if create_labels:
        df_features = engineer.create_labels(df_features, look_ahead_hours)
        df_features = engineer.create_impact_labels(df_features)
    
    return df_features
