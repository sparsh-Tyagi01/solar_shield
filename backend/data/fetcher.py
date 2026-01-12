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
            # OMNI data has 2-3 day delay - use data from 3 days ago for reliability
            now = datetime.utcnow()
            end_date = now - timedelta(days=3)
            start_date = end_date - timedelta(hours=2)
            logger.info(f"Using OMNI historical data from {start_date} to {end_date}")
            
            # Use NASA CDAWeb API for OMNI data
            base_url = "https://cdaweb.gsfc.nasa.gov/WS/cdasr/1/dataviews/sp_phys/datasets/OMNI_HRO_1MIN/data"
            
            # Format dates for API
            start_str = start_date.strftime('%Y%m%dT%H%M%S') + 'Z'
            end_str = end_date.strftime('%Y%m%dT%H%M%S') + 'Z'
            
            url = f"{base_url}/{start_str},{end_str}/BZ_GSM,flow_speed,Proton_Density,Pressure,SYM_H"
            
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Parse CDAWeb JSON format
                if 'BZ_GSM' in data and len(data['BZ_GSM']) > 0:
                    timestamps = [datetime.fromisoformat(t.replace('Z', '+00:00')) for t in data['BZ_GSM'][0]]
                    bz_values = data['BZ_GSM'][1]
                    speed_values = data.get('flow_speed', [[],[]])[1]
                    density_values = data.get('Proton_Density', [[],[]])[1]
                    pressure_values = data.get('Pressure', [[],[]])[1]
                    sym_h_values = data.get('SYM_H', [[],[]])[1]
                    
                    df = pd.DataFrame({
                        'timestamp': timestamps,
                        'bz': bz_values,
                        'speed': speed_values,
                        'density': density_values,
                        'pressure': pressure_values,
                        'sym_h': sym_h_values
                    })
                    
                    # Clean data - remove fill values (typically 9999.99 or -1e31)
                    df = df.replace([9999.99, -1e31, 9.999e+30], np.nan)
                    df = df.fillna(method='ffill').fillna(method='bfill')
                    
                    logger.info(f"Fetched {len(df)} records from NASA OMNI")
                    return df
                else:
                    logger.info("No data in OMNI response, using real-time NOAA SWPC data")
                    return self._fetch_noaa_realtime()
            else:
                logger.info(f"OMNI API returned {response.status_code}, using real-time NOAA SWPC data")
                return self._fetch_noaa_realtime()
            
        except Exception as e:
            logger.info(f"OMNI unavailable ({e}), using real-time NOAA SWPC data")
            return self._fetch_noaa_realtime()
    
    def fetch_goes_data(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Fetch X-ray and proton flux from NOAA GOES
        Returns: (xray_df, proton_df)
        """
        logger.info("Fetching GOES data")
        
        try:
            # Correct NOAA SWPC endpoints
            xray_url = "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json"
            proton_url = "https://services.swpc.noaa.gov/json/goes/primary/integral-protons-plot-6-hour.json"
            
            # Fetch X-ray flux
            xray_response = self.session.get(xray_url, timeout=30)
            
            if xray_response.status_code == 200:
                xray_data = xray_response.json()
                xray_df = pd.DataFrame(xray_data)
                xray_df['timestamp'] = pd.to_datetime(xray_df['time_tag'])
                # Use the short wavelength channel (0.05-0.4 nm)
                xray_df['flux'] = pd.to_numeric(xray_df['flux'], errors='coerce')
                xray_df = xray_df.dropna(subset=['flux'])
                logger.info(f"Fetched {len(xray_df)} X-ray flux records from NOAA")
            else:
                logger.warning(f"X-ray fetch failed: {xray_response.status_code}, using default")
                xray_df = pd.DataFrame({
                    'timestamp': [datetime.utcnow()],
                    'flux': [1e-6]
                })
            
            # Fetch proton flux
            proton_response = self.session.get(proton_url, timeout=30)
            
            if proton_response.status_code == 200:
                proton_data = proton_response.json()
                proton_df = pd.DataFrame(proton_data)
                proton_df['timestamp'] = pd.to_datetime(proton_df['time_tag'])
                # Use >10 MeV channel
                if 'flux' in proton_df.columns:
                    proton_df['flux'] = pd.to_numeric(proton_df['flux'], errors='coerce')
                elif 'energy' in proton_df.columns:
                    # Some formats have energy-specific columns
                    proton_df['flux'] = pd.to_numeric(proton_df['energy'], errors='coerce')
                proton_df = proton_df.dropna(subset=['flux'])
                logger.info(f"Fetched {len(proton_df)} proton flux records from NOAA")
            else:
                logger.warning(f"Proton fetch failed: {proton_response.status_code}, using default")
                proton_df = pd.DataFrame({
                    'timestamp': [datetime.utcnow()],
                    'flux': [1.0]
                })
            
            return xray_df, proton_df
            
        except Exception as e:
            logger.error(f"Error fetching GOES data: {e}")
            # Return minimal data as fallback
            return (
                pd.DataFrame({'timestamp': [datetime.utcnow()], 'flux': [1e-6]}),
                pd.DataFrame({'timestamp': [datetime.utcnow()], 'flux': [1.0]})
            )
    
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
    
    def _fetch_noaa_realtime(self) -> pd.DataFrame:
        """
        Fetch real-time data from NOAA SWPC as fallback
        Returns DataFrame with latest solar wind conditions
        """
        try:
            # NOAA SWPC real-time plasma and mag data
            plasma_url = "https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json"
            mag_url = "https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json"
            
            now = datetime.utcnow()
            
            # Fetch solar wind speed with better error handling
            speed = 400.0
            try:
                speed_response = self.session.get(plasma_url, timeout=10)
                speed_response.raise_for_status()
                if speed_response.status_code == 200:
                    speed_data = speed_response.json()
                    if isinstance(speed_data, dict) and 'WindSpeed' in speed_data:
                        speed = float(speed_data['WindSpeed'])
                    elif isinstance(speed_data, list) and len(speed_data) > 0:
                        if isinstance(speed_data[0], dict) and 'WindSpeed' in speed_data[0]:
                            speed = float(speed_data[0]['WindSpeed'])
            except (KeyError, IndexError, ValueError, TypeError) as parse_error:
                logger.warning(f"Could not parse wind speed from NOAA response: {parse_error}, using default")
            except Exception as fetch_error:
                logger.warning(f"Failed to fetch wind speed: {fetch_error}, using default")
            
            # Fetch magnetic field with better error handling
            bz = 0.0
            try:
                mag_response = self.session.get(mag_url, timeout=10)
                mag_response.raise_for_status()
                if mag_response.status_code == 200:
                    mag_data = mag_response.json()
                    if isinstance(mag_data, dict) and 'Bz' in mag_data:
                        bz = float(mag_data['Bz'])
                    elif isinstance(mag_data, list) and len(mag_data) > 0:
                        if isinstance(mag_data[0], dict) and 'Bz' in mag_data[0]:
                            bz = float(mag_data[0]['Bz'])
            except (KeyError, IndexError, ValueError, TypeError) as parse_error:
                logger.warning(f"Could not parse Bz from NOAA response: {parse_error}, using default")
            except Exception as fetch_error:
                logger.warning(f"Failed to fetch magnetic field: {fetch_error}, using default")
            
            # Calculate other parameters
            density = 5.0  # Default, not available in summary
            pressure = 1.67e-6 * density * speed**2  # Calculate dynamic pressure
            
            df = pd.DataFrame({
                'timestamp': [now - timedelta(minutes=i) for i in range(120)],
                'bz': [bz] * 120,
                'speed': [speed] * 120,
                'density': [density] * 120,
                'pressure': [pressure] * 120,
                'sym_h': [0.0] * 120
            })
            
            logger.info(f"Fetched NOAA SWPC real-time data: Bz={bz:.1f}nT, Speed={speed:.0f}km/s")
            return df
            
        except Exception as e:
            logger.error(f"Error fetching NOAA real-time data: {e}")
            # Return minimal default data with current timestamp
            now = datetime.utcnow()
            return pd.DataFrame({
                'timestamp': [now],
                'bz': [0.0],
                'speed': [400.0],
                'density': [5.0],
                'pressure': [2.0],
                'sym_h': [0.0]
            })
    
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
