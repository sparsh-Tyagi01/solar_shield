"""
Real-time satellite tracking using N2YO API and correlation with space weather
"""
import requests
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
from backend.utils.logger import get_logger

logger = get_logger(__name__)

# N2YO API - Free tier allows 1000 requests/hour
# Sign up at https://www.n2yo.com/api/ to get a free API key
N2YO_API_KEY = os.getenv('N2YO_API_KEY', 'YOUR_API_KEY_HERE')
N2YO_BASE_URL = "https://api.n2yo.com/rest/v1/satellite"

# Well-known satellite NORAD IDs (Catalog numbers)
TRACKED_SATELLITES = {
    'ISS': {
        'norad_id': 25544,
        'name': 'International Space Station',
        'type': 'ISS',
        'vulnerability': 2.0  # Low orbit = high vulnerability
    },
    'HST': {
        'norad_id': 20580,
        'name': 'Hubble Space Telescope',
        'type': 'Research',
        'vulnerability': 1.8
    },
    'GPS_BIIF_12': {
        'norad_id': 41019,
        'name': 'GPS IIF-12 (SVN 71)',
        'type': 'GPS',
        'vulnerability': 1.0
    },
    'GPS_BIIF_7': {
        'norad_id': 39741,
        'name': 'GPS IIF-7 (SVN 68)',
        'type': 'GPS',
        'vulnerability': 1.0
    },
    'GOES_18': {
        'norad_id': 51850,
        'name': 'GOES-18 (GOES-T)',
        'type': 'Weather',
        'vulnerability': 0.8  # GEO orbit = lower vulnerability
    },
    'TDRS_10': {
        'norad_id': 28899,
        'name': 'TDRS-10',
        'type': 'Communication',
        'vulnerability': 0.9
    }
}


class SatelliteTracker:
    """Track real satellites and correlate with space weather"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or N2YO_API_KEY
        self.cache = {}
        self.cache_duration = timedelta(minutes=5)  # Cache for 5 minutes
        self.last_health_update = {}
        
        # Log API key status
        if self.api_key and self.api_key != 'YOUR_API_KEY_HERE':
            logger.info("✓ N2YO API key configured - will attempt real satellite tracking")
        else:
            logger.warning("⚠ N2YO API key not configured - using simulated satellite data")
            logger.info("To enable real tracking: Get free API key from https://www.n2yo.com/api/")
            logger.info("Then add to .env: N2YO_API_KEY=your_key_here")
        
    def get_satellite_position(self, norad_id: int, observer_lat: float = 0, 
                              observer_lng: float = 0, observer_alt: float = 0) -> Optional[Dict]:
        """
        Get real-time position of a satellite
        
        Args:
            norad_id: NORAD catalog number
            observer_lat: Observer latitude (default: equator)
            observer_lng: Observer longitude (default: prime meridian)
            observer_alt: Observer altitude in meters (default: sea level)
        """
        cache_key = f"{norad_id}_{observer_lat}_{observer_lng}"
        
        # Check cache
        if cache_key in self.cache:
            cached_data, cached_time = self.cache[cache_key]
            if datetime.now() - cached_time < self.cache_duration:
                return cached_data
        
        try:
            url = f"{N2YO_BASE_URL}/positions/{norad_id}/{observer_lat}/{observer_lng}/{observer_alt}/1"
            params = {'apiKey': self.api_key}
            
            # Check if API key is configured
            if self.api_key == 'YOUR_API_KEY_HERE' or not self.api_key:
                logger.debug(f"N2YO API key not configured, skipping real data fetch for satellite {norad_id}")
                return None
            
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                self.cache[cache_key] = (data, datetime.now())
                return data
            elif response.status_code == 401:
                logger.warning(f"N2YO API authentication failed (401) - check your API key")
                return None
            elif response.status_code == 429:
                logger.warning(f"N2YO API rate limit exceeded (429) for satellite {norad_id}")
                return None
            else:
                logger.warning(f"N2YO API returned status {response.status_code} for satellite {norad_id}: {response.text[:100]}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching satellite position for {norad_id}: {e}")
            return None
    
    def calculate_radiation_exposure(self, altitude_km: float, solar_wind_speed: float, 
                                    bz: float, proton_flux: float) -> float:
        """
        Calculate radiation exposure based on altitude and space weather
        
        Higher altitude = more exposure to radiation
        Negative Bz = weakened magnetosphere = more exposure
        Higher solar wind speed = more particles
        """
        # Base radiation increases exponentially with altitude
        if altitude_km < 1000:  # LEO
            altitude_factor = altitude_km / 500  # 0.8 - 2.0
        elif altitude_km < 36000:  # MEO
            altitude_factor = 2.0 + (altitude_km - 1000) / 5000  # 2.0 - 9.0
        else:  # GEO
            altitude_factor = 8.0 + (altitude_km - 36000) / 10000  # 8.0 - 10+
        
        # Solar wind impact (400-800 km/s normal, >800 is storm)
        wind_factor = max(1.0, solar_wind_speed / 400)
        
        # Bz impact (negative Bz opens magnetosphere)
        bz_factor = 1.0 if bz >= 0 else (1.0 + abs(bz) / 10)
        
        # Proton flux impact (>10 is elevated, >100 is high)
        proton_factor = 1.0 + np.log10(max(1, proton_flux)) / 2
        
        radiation = altitude_factor * wind_factor * bz_factor * proton_factor
        return radiation
    
    def calculate_health_degradation(self, satellite_id: str, radiation_exposure: float,
                                    vulnerability: float, time_delta_hours: float = 1.0) -> float:
        """
        Calculate health degradation for a satellite based on radiation exposure
        
        Returns degradation percentage (0-100)
        """
        # Initialize health tracking if needed
        if satellite_id not in self.last_health_update:
            self.last_health_update[satellite_id] = {
                'health': 95.0 + np.random.uniform(-3, 3),  # Start with healthy satellites
                'degradation': np.random.uniform(0, 5),
                'last_update': datetime.now()
            }
        
        satellite_health = self.last_health_update[satellite_id]
        
        # Calculate time since last update
        time_since_update = (datetime.now() - satellite_health['last_update']).total_seconds() / 3600
        
        # Degradation rate increases with radiation exposure
        # Normal conditions: ~0.01% per hour
        # Storm conditions: up to 1% per hour
        base_degradation_rate = 0.01
        radiation_multiplier = radiation_exposure / 5.0  # Normalize to ~5 as baseline
        
        degradation_rate = base_degradation_rate * radiation_multiplier * vulnerability
        new_degradation = degradation_rate * time_since_update
        
        # Update degradation (with some recovery when conditions improve)
        recovery_rate = 0.005 if radiation_exposure < 3 else 0
        satellite_health['degradation'] = min(100, max(0, 
            satellite_health['degradation'] + new_degradation - recovery_rate * time_since_update
        ))
        
        # Health inversely related to degradation
        satellite_health['health'] = max(0, 100 - satellite_health['degradation'] * 0.85)
        satellite_health['last_update'] = datetime.now()
        
        return satellite_health['health'], satellite_health['degradation']
    
    def get_fleet_status(self, solar_wind_speed: float = 450, bz: float = 0,
                        proton_flux: float = 1.0) -> List[Dict[str, Any]]:
        """
        Get status of all tracked satellites with real-time data
        
        Args:
            solar_wind_speed: Current solar wind speed (km/s)
            bz: IMF Bz component (nT)
            proton_flux: Proton flux (pfu)
        """
        fleet_status = []
        
        logger.info(f"Fetching fleet status for {len(TRACKED_SATELLITES)} satellites...")
        
        for sat_key, sat_info in TRACKED_SATELLITES.items():
            logger.info(f"Processing {sat_key}: {sat_info['name']} (NORAD {sat_info['norad_id']})")
            try:
                # Get real-time position
                position_data = self.get_satellite_position(sat_info['norad_id'])
                
                if position_data and 'positions' in position_data:
                    pos = position_data['positions'][0]
                    altitude = pos.get('sataltitude', 500)  # km
                    
                    # Calculate radiation exposure
                    radiation = self.calculate_radiation_exposure(
                        altitude, solar_wind_speed, bz, proton_flux
                    )
                    
                    # Calculate health degradation
                    health, degradation = self.calculate_health_degradation(
                        sat_key, radiation, sat_info['vulnerability']
                    )
                    
                    satellite_status = {
                        'id': sat_key.lower().replace('_', '-'),
                        'name': sat_info['name'],
                        'type': sat_info['type'],
                        'health': round(health, 1),
                        'degradation': round(degradation, 1),
                        'altitude': round(altitude, 1),
                        'latitude': pos.get('satlatitude', 0),
                        'longitude': pos.get('satlongitude', 0),
                        'velocity': pos.get('satvelocity', 0),
                        'visibility': pos.get('visibility', 'unknown'),
                        'radiation_exposure': round(radiation, 2),
                        'orbitalPeriod': position_data.get('info', {}).get('satperiod', 90),
                        'inclination': 51.6 if sat_info['type'] == 'ISS' else 55,  # Would need TLE data for exact
                        'phase': 0,  # Calculated from position
                        'real_data': True  # Flag to indicate this is real data
                    }
                    
                    fleet_status.append(satellite_status)
                    logger.info(f"Updated {sat_info['name']}: Health={health:.1f}%, Alt={altitude:.0f}km")
                    
                else:
                    # Fallback to simulated data if API fails
                    logger.warning(f"Could not fetch real data for {sat_info['name']}, using simulation")
                    fleet_status.append(self._get_simulated_satellite(sat_key, sat_info, 
                                                                      solar_wind_speed, bz, proton_flux))
                    
            except Exception as e:
                logger.error(f"Error processing satellite {sat_key}: {e}")
                # Fallback to simulated
                logger.info(f"Adding simulated data for {sat_info['name']}")
                fleet_status.append(self._get_simulated_satellite(sat_key, sat_info,
                                                                  solar_wind_speed, bz, proton_flux))
        
        logger.info(f"Fleet status complete: {len(fleet_status)} satellites returned")
        return fleet_status
    
    def _get_simulated_satellite(self, sat_key: str, sat_info: Dict, 
                                solar_wind_speed: float, bz: float, 
                                proton_flux: float) -> Dict[str, Any]:
        """Fallback simulated satellite data when real API is unavailable"""
        # Use typical altitudes for each satellite type
        altitude_map = {
            'ISS': 408,
            'Research': 547,
            'GPS': 20200,
            'Communication': 35786,
            'Weather': 35786
        }
        altitude = altitude_map.get(sat_info['type'], 500)
        
        radiation = self.calculate_radiation_exposure(altitude, solar_wind_speed, bz, proton_flux)
        health, degradation = self.calculate_health_degradation(
            sat_key, radiation, sat_info['vulnerability']
        )
        
        return {
            'id': sat_key.lower().replace('_', '-'),
            'name': f"{sat_info['name']} (Simulated)",
            'type': sat_info['type'],
            'health': round(health, 1),
            'degradation': round(degradation, 1),
            'altitude': altitude,
            'latitude': np.random.uniform(-60, 60),
            'longitude': np.random.uniform(-180, 180),
            'velocity': 7.5 if altitude < 1000 else 3.0,
            'visibility': 'unknown',
            'radiation_exposure': round(radiation, 2),
            'orbitalPeriod': 90 if altitude < 1000 else 1440,
            'inclination': 51.6 if sat_info['type'] == 'ISS' else 55,
            'phase': 0,
            'real_data': False
        }


# Global tracker instance
_satellite_tracker = None

def get_satellite_tracker() -> SatelliteTracker:
    """Get or create satellite tracker instance"""
    global _satellite_tracker
    if _satellite_tracker is None:
        _satellite_tracker = SatelliteTracker()
    return _satellite_tracker
