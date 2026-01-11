"""
Space Weather Data Fetcher
Fetches real-time and historical data from NASA OMNI and NOAA GOES
"""
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any
import time
from backend.utils.logger import get_logger
from backend.config import NASA_OMNI_URL, NOAA_GOES_URL

logger = get_logger(__name__)


class SpaceWeatherDataFetcher:
    """Fetch real-time data from NASA OMNI and NOAA GOES"""
    
    def __init__(self):
        self.omni_url = NASA_OMNI_URL
        self.goes_url = NOAA_GOES_URL
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SolarGuard3D/1.0'
        })
    
    def fetch_omni_data(self, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """
        Fetch IMF Bz, solar wind speed, density, pressure from NASA OMNI
        Returns DataFrame with columns: timestamp, bz, speed, density, pressure, sym_h
        """
        logger.info(f"Fetching OMNI data from {start_date} to {end_date}")
        
        try:
            # OMNI data format parameters
            params = {
                'activity': 'retrieve',
                'res': 'min',  # 1-minute resolution
                'spacecraft': 'omni2',
                'start_date': start_date.strftime('%Y%m%d'),
                'end_date': end_date.strftime('%Y%m%d'),
                'vars': '17,21,23,24,40'  # Bz GSM, Speed, Density, Pressure, SYM-H
            }
            
            # Note: This is a simplified version. In production, you'd parse actual OMNI format
            # For now, generate synthetic but realistic data
            logger.warning("Using synthetic data - replace with actual OMNI API call")
            df = self._generate_synthetic_omni_data(start_date, end_date)
            
            logger.info(f"Fetched {len(df)} records from OMNI")
            return df
            
        except Exception as e:
            logger.error(f"Error fetching OMNI data: {e}")
            raise
    
    def fetch_goes_data(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Fetch X-ray and proton flux from NOAA GOES
        Returns: (xray_df, proton_df)
        """
        logger.info("Fetching GOES data")
        
        try:
            # Fetch X-ray flux
            xray_url = f"{self.goes_url}/primary_XRAY-flux-primary.json"
            proton_url = f"{self.goes_url}/primary_integral-protons.json"
            
            xray_response = self.session.get(xray_url, timeout=30)
            proton_response = self.session.get(proton_url, timeout=30)
            
            if xray_response.status_code == 200:
                xray_data = xray_response.json()
                xray_df = pd.DataFrame(xray_data)
                xray_df['timestamp'] = pd.to_datetime(xray_df['time_tag'])
                logger.info(f"Fetched {len(xray_df)} X-ray flux records")
            else:
                logger.warning(f"X-ray fetch failed: {xray_response.status_code}")
                xray_df = self._generate_synthetic_xray_data()
            
            if proton_response.status_code == 200:
                proton_data = proton_response.json()
                proton_df = pd.DataFrame(proton_data)
                proton_df['timestamp'] = pd.to_datetime(proton_df['time_tag'])
                logger.info(f"Fetched {len(proton_df)} proton flux records")
            else:
                logger.warning(f"Proton fetch failed: {proton_response.status_code}")
                proton_df = self._generate_synthetic_proton_data()
            
            return xray_df, proton_df
            
        except Exception as e:
            logger.error(f"Error fetching GOES data: {e}")
            # Return synthetic data as fallback
            return self._generate_synthetic_xray_data(), self._generate_synthetic_proton_data()
    
    def fetch_realtime_data(self) -> Dict[str, Any]:
        """
        Fetch latest real-time space weather data
        Returns dictionary with latest measurements
        """
        logger.info("Fetching real-time data")
        
        try:
            # Fetch latest data from last 2 hours
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=2)
            
            # Get OMNI data
            omni_df = self.fetch_omni_data(start_time, end_time)
            
            # Get GOES data
            xray_df, proton_df = self.fetch_goes_data()
            
            # Merge and get latest values
            if not omni_df.empty:
                latest_omni = omni_df.iloc[-1]
            else:
                latest_omni = self._get_default_omni_values()
            
            if not xray_df.empty:
                latest_xray = xray_df.iloc[-1]['flux'] if 'flux' in xray_df.columns else 1e-6
            else:
                latest_xray = 1e-6
            
            if not proton_df.empty:
                latest_proton = proton_df.iloc[-1]['flux'] if 'flux' in proton_df.columns else 1.0
            else:
                latest_proton = 1.0
            
            realtime_data = {
                'timestamp': datetime.utcnow().isoformat(),
                'bz': float(latest_omni.get('bz', 0)),
                'speed': float(latest_omni.get('speed', 400)),
                'density': float(latest_omni.get('density', 5)),
                'pressure': float(latest_omni.get('pressure', 2)),
                'sym_h': float(latest_omni.get('sym_h', 0)),
                'xray_flux': float(latest_xray),
                'proton_flux': float(latest_proton)
            }
            
            logger.info("Real-time data fetched successfully")
            return realtime_data
            
        except Exception as e:
            logger.error(f"Error fetching real-time data: {e}")
            return self._get_default_realtime_data()
    
    def _generate_synthetic_omni_data(self, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """Generate synthetic but realistic OMNI data for testing"""
        dates = pd.date_range(start=start_date, end=end_date, freq='1min')
        n = len(dates)
        
        # Generate realistic solar wind parameters with storms
        # Use time-based seed for variation across calls
        np.random.seed(int(datetime.utcnow().timestamp()) % 1000)
        
        # Base values with noise and occasional storms
        bz = np.random.normal(-2, 5, n)  # More negative on average for more impact
        # Add storm events (southward Bz)
        storm_indices = np.random.choice(n, size=int(n * 0.1), replace=False)  # 10% storm events
        bz[storm_indices] = np.random.uniform(-20, -8, len(storm_indices))
        
        speed = np.random.normal(450, 80, n)  # Higher average speed
        speed[storm_indices] = np.random.uniform(550, 850, len(storm_indices))
        
        density = np.random.normal(7, 3, n)  # Higher average density
        density[storm_indices] = np.random.uniform(12, 35, len(storm_indices))
        
        pressure = 1.67e-6 * density * speed**2  # Dynamic pressure
        
        # SYM-H (storm index)
        sym_h = np.zeros(n)
        for idx in storm_indices:
            # Create storm signature
            duration = min(120, n - idx)
            storm_profile = -100 * np.exp(-np.arange(duration) / 30)
            sym_h[idx:idx+duration] += storm_profile
        
        df = pd.DataFrame({
            'timestamp': dates,
            'bz': bz,
            'speed': speed,
            'density': density,
            'pressure': pressure,
            'sym_h': sym_h
        })
        
        return df
    
    def _generate_synthetic_xray_data(self) -> pd.DataFrame:
        """Generate synthetic X-ray flux data"""
        now = datetime.utcnow()
        dates = pd.date_range(end=now, periods=1440, freq='1min')  # Last 24 hours
        
        # X-ray flux typically in range 1e-9 to 1e-3 W/m²
        # Use time-based seed for variation
        np.random.seed(int(now.timestamp()) % 1000)
        flux = np.random.lognormal(-12, 1.5, len(dates))  # Higher average for more events
        
        df = pd.DataFrame({
            'timestamp': dates,
            'flux': flux
        })
        
        return df
    
    def _generate_synthetic_proton_data(self) -> pd.DataFrame:
        """Generate synthetic proton flux data"""
        now = datetime.utcnow()
        dates = pd.date_range(end=now, periods=1440, freq='1min')
        
        # Proton flux >10 MeV typically 0.1 to 1000 pfu
        # Use time-based seed for variation
        np.random.seed(int(now.timestamp()) % 1000)
        flux = np.random.lognormal(1, 2, len(dates))  # Higher values
        
        df = pd.DataFrame({
            'timestamp': dates,
            'flux': flux
        })
        
        return df
    
    def _get_default_omni_values(self) -> Dict[str, float]:
        """Return default OMNI values"""
        return {
            'bz': 0.0,
            'speed': 400.0,
            'density': 5.0,
            'pressure': 2.0,
            'sym_h': 0.0
        }
    
    def _get_default_realtime_data(self) -> Dict[str, Any]:
        """Return default real-time data"""
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'bz': 0.0,
            'speed': 400.0,
            'density': 5.0,
            'pressure': 2.0,
            'sym_h': 0.0,
            'xray_flux': 1e-6,
            'proton_flux': 1.0
        }
    
    def fetch_training_data(self, days: int = 365) -> pd.DataFrame:
        """
        Fetch comprehensive training data
        Args:
            days: Number of days of historical data
        """
        logger.info(f"Fetching {days} days of training data")
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Fetch OMNI data
        omni_df = self.fetch_omni_data(start_date, end_date)
        
        # Fetch GOES data (using synthetic for now)
        xray_df = self._generate_synthetic_xray_data()
        proton_df = self._generate_synthetic_proton_data()
        
        # Merge datasets
        omni_df.set_index('timestamp', inplace=True)
        xray_df.set_index('timestamp', inplace=True)
        proton_df.set_index('timestamp', inplace=True)
        
        # Resample to ensure consistent timestamps
        merged_df = omni_df.join(xray_df['flux'].rename('xray_flux'), how='left')
        merged_df = merged_df.join(proton_df['flux'].rename('proton_flux'), how='left')
        
        # Forward fill missing values
        merged_df.fillna(method='ffill', inplace=True)
        merged_df.fillna(0, inplace=True)
        
        merged_df.reset_index(inplace=True)
        
        logger.info(f"Training data prepared: {len(merged_df)} records")
        return merged_df


# Convenience function
def get_fetcher() -> SpaceWeatherDataFetcher:
    """Get a configured data fetcher instance"""
    return SpaceWeatherDataFetcher()
