# Real Satellite Tracking Integration

## Overview

SolarShield now integrates **real-time satellite tracking** using the N2YO API to monitor actual satellites and correlate their health with current space weather conditions.

## Features

### Real Satellite Data
- **ISS (International Space Station)** - NORAD ID: 25544
- **Hubble Space Telescope** - NORAD ID: 20580
- **GPS IIF-12 (SVN 71)** - NORAD ID: 41019
- **GPS IIF-7 (SVN 68)** - NORAD ID: 39741
- **GOES-18 Weather Satellite** - NORAD ID: 51850
- **TDRS-13 Communication Satellite** - NORAD ID: 41932

### Health Calculation Based on:
1. **Real-time Position** - Latitude, longitude, altitude from N2YO API
2. **Orbital Parameters** - Velocity, inclination, period
3. **Space Weather Correlation**:
   - **Radiation Exposure**: Higher altitude = more exposure
   - **Solar Wind Impact**: Speed and particle density
   - **Magnetic Field**: Negative Bz opens magnetosphere
   - **Proton Flux**: Direct radiation measurement

### Degradation Model
- **LEO Satellites (ISS, Hubble)**: High vulnerability (2.0x) due to low altitude
- **MEO Satellites (GPS)**: Moderate vulnerability (1.0x)
- **GEO Satellites (GOES, TDRS)**: Lower vulnerability (0.8-0.9x)
- Health degrades during storm conditions and slowly recovers when conditions improve

## Setup Instructions

### 1. Get N2YO API Key (FREE)

1. Visit: https://www.n2yo.com/api/
2. Click "Request API Key"
3. Fill out the form with your email
4. You'll receive an API key instantly (free tier: 1000 requests/hour)

### 2. Configure API Key

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
N2YO_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Install Dependencies

Dependencies are already included in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Restart Backend

```bash
uvicorn backend.main:app --reload
```

You should see in the logs:
```
INFO: Initializing real-time satellite tracker...
INFO: Satellite fleet initialized: 6 satellites (X with real data, Y simulated)
```

## How It Works

### 1. Satellite Position Fetching
```python
# N2YO API call
GET https://api.n2yo.com/rest/v1/satellite/positions/{norad_id}/{lat}/{lng}/{alt}/1
```

### 2. Radiation Exposure Calculation
```python
radiation = altitude_factor × wind_factor × bz_factor × proton_factor
```

- **Altitude Factor**: Exponential with height (LEO: 0.8-2.0, MEO: 2.0-9.0, GEO: 8.0-10+)
- **Wind Factor**: Solar wind speed / 400 km/s baseline
- **Bz Factor**: 1.0 + |negative_Bz| / 10 (southward Bz weakens protection)
- **Proton Factor**: log₁₀(proton_flux) / 2 (direct radiation)

### 3. Health Degradation
```python
degradation_rate = base_rate × radiation_multiplier × satellite_vulnerability
health = 100 - degradation × 0.85
```

- Normal conditions: ~0.01% degradation per hour
- Storm conditions: up to 1% degradation per hour
- Slow recovery when conditions improve

### 4. Real-Time Updates
- Positions cached for 5 minutes (to stay within API limits)
- Health recalculated on every data update (1 minute intervals)
- WebSocket broadcasts include real satellite data

## API Response Format

### `/api/satellites` Endpoint

```json
{
  "satellites": [
    {
      "id": "iss",
      "name": "International Space Station",
      "type": "ISS",
      "health": 94.2,
      "degradation": 6.8,
      "altitude": 408.5,
      "latitude": 23.45,
      "longitude": -45.67,
      "velocity": 7.66,
      "visibility": "daylight",
      "radiation_exposure": 4.32,
      "orbitalPeriod": 90,
      "inclination": 51.6,
      "real_data": true
    }
  ],
  "count": 6,
  "timestamp": "2026-01-12T10:30:00"
}
```

### Key Fields

- **real_data**: `true` = from N2YO API, `false` = simulated fallback
- **radiation_exposure**: Current radiation level (units)
- **health**: 0-100% (100 = perfect health)
- **degradation**: 0-100% (0 = no degradation)
- **visibility**: "daylight", "eclipsed", or "visible" (from N2YO)

## Fallback Behavior

If N2YO API is unavailable (no API key, rate limit, or network error):
- System falls back to **simulated data** with realistic physics
- Satellites marked with `real_data: false`
- Still correlates with actual space weather conditions
- Logs warning messages

## Rate Limiting

**N2YO Free Tier**: 1000 requests/hour

With 6 satellites and 5-minute cache:
- 6 satellites × 12 requests/hour = 72 requests/hour
- **Well within limits** with plenty of headroom

## Monitoring

Check logs for satellite tracking status:

```bash
# Successful real data
INFO: Updated International Space Station: Health=94.2%, Alt=408km

# Fallback to simulation
WARNING: Could not fetch real data for GPS IIF-12, using simulation
```

## Future Enhancements

### Planned Features
1. **More Satellites**: Add Starlink, OneWeb, other constellations
2. **Historical TLE Data**: Better orbital predictions
3. **Anomaly Detection**: Flag unusual degradation patterns
4. **Satellite Operators API**: Direct integration with NASA, SpaceX, etc.
5. **Predictive Alerts**: Warn operators before storm impacts

### Alternative APIs
- **Space-Track.org**: US Space Force catalog (requires account)
- **Celestrak**: Free TLE data (no real-time positions)
- **NASA API**: Limited satellite data
- **Direct Operator APIs**: SpaceX, NASA, ESA (varies by access)

## Troubleshooting

### "API Key Invalid" Error
- Double-check your N2YO API key in `.env`
- Make sure no quotes around the key
- Verify key is active at N2YO dashboard

### "Rate Limit Exceeded"
- System will automatically fall back to simulation
- Wait for rate limit reset (hourly)
- Consider upgrading to N2YO paid tier if needed

### No Real Data Showing
1. Check `.env` file has correct API key
2. Restart backend after adding key
3. Check logs for error messages
4. Verify internet connectivity
5. Test API directly: `curl "https://api.n2yo.com/rest/v1/satellite/positions/25544/0/0/0/1/?apiKey=YOUR_KEY"`

## Credits

- **N2YO.com** - Real-time satellite tracking API
- **CelesTrak** - Orbital element data
- **Space-Track.org** - Satellite catalog
- **NOAA SWPC** - Space weather data

---

**Note**: This integration uses actual satellite positions correlated with real space weather data. Health percentages are calculated models based on radiation exposure, not official satellite telemetry.
