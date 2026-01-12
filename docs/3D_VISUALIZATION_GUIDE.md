# 3D Solar System Visualization - Technical Documentation

## Overview

The SolarShield 3D Solar System Visualization provides a realistic, data-driven representation of the Sun-Earth-Moon system with 6 active satellites. All visualizations are based on real-time data from the machine learning models.

## Features

### 1. **Sun Visualization**
- **Dynamic Solar Corona**: Pulsates based on radiation levels
- **Solar Flares**: 8 animated flares that respond to X-ray flux data
- **Radiation Intensity**: Color and brightness change with solar activity
- **Particle Emission**: Solar wind particles stream toward Earth

### 2. **Earth System**
- **Realistic Earth**: Rotating sphere with cloud layer and atmospheric glow
- **Magnetic Field Lines**: Dipole field visualization (8 field lines)
- **Field Color Dynamics**:
  - Blue: Normal conditions (positive Bz)
  - Red: Compressed field (negative Bz - geomagnetic storm conditions)
- **Field Strength**: Opacity and size respond to magnetic field strength

### 3. **Moon**
- **Realistic Orbit**: Orbits Earth at proper relative distance
- **Inclination**: Slight orbital tilt for realism
- **Surface Detail**: Gray, rocky appearance

### 4. **Six Satellites**

The system tracks 6 different satellites with unique characteristics:

| Satellite | Type | Altitude | Orbital Period | Purpose |
|-----------|------|----------|----------------|---------|
| GPS-A | GPS | 20,200 km | 40s | Navigation |
| COMM-1 | Communication | 35,786 km | 60s | Communications |
| WEATHER-SAT | Weather | 35,786 km | 60s | Weather monitoring |
| ISS | ISS | 408 km | 30s | Space Station (1.5x size) |
| GPS-B | GPS | 20,200 km | 40s | Navigation |
| RESEARCH-X | Research | 500 km | 32s | Scientific research |

Each satellite has:
- **Realistic orbital mechanics** with different inclinations
- **Solar panels** that glow based on health
- **Health indicators** (color-coded: green → yellow → orange → red)
- **Radiation degradation** based on distance from Sun
- **Real-time labels** showing name and health percentage

### 5. **Data-Driven Effects**

All visual effects are calculated from ML model outputs:

#### Solar Radiation
```typescript
radiationLevel = |Bz| + (speed - 400)/50 + density
```

#### Magnetic Field Strength
```typescript
fieldStrength = Bz < 0 ? max(0.3, 1.0 + Bz/20) : 1.0 + Bz/100
```

#### Satellite Degradation
```typescript
radiationFactor = 1 / (distanceFromSun²)
degradationRate = radiationLevel × radiationFactor × 0.001
health = max(0, 100 - degradation × 0.7)
```

## Data Sources

### Input Parameters
- `radiationLevel`: Calculated from Bz, speed, and density
- `bzValue`: IMF Bz component (nT) - indicates magnetic field orientation
- `solarWindSpeed`: Solar wind speed (km/s)
- `protonFlux`: Proton flux (pfu)
- `xrayFlux`: X-ray flux (W/m²)
- `magneticFieldStrength`: Earth's magnetic field strength (relative)

### Real-Time Updates
- Data fetched every 60 seconds from backend API
- WebSocket connection for live updates
- Satellite health recalculated every frame based on current conditions

## Component Structure

```
SolarSystemVisualization/
├── Sun (with corona and flares)
├── SolarRadiation (particle system)
├── Earth
│   ├── Sphere (main body)
│   ├── Clouds (atmosphere)
│   ├── Glow (atmospheric effect)
│   └── MagneticField (8 field lines)
├── Moon (orbiting Earth)
└── Satellites (6 instances)
    ├── Body (main structure)
    ├── SolarPanels (2 panels)
    ├── Antenna
    └── Label (HTML overlay)
```

## Physics Implementation

### Orbital Mechanics
Each satellite follows realistic orbital dynamics:

```typescript
orbitalSpeed = (2 × π) / orbitalPeriod
angle = initialPhase + time × orbitalSpeed

position.x = earthX + cos(angle) × orbitRadius × cos(inclination)
position.y = sin(angle) × orbitRadius × sin(inclination)
position.z = sin(angle) × orbitRadius × cos(inclination)
```

### Scale Factors
- Earth radius in scene: 0.4 units
- Real Earth radius: 6,371 km
- Sun-Earth distance: 8 units (compressed for visibility)
- Satellite altitudes: Scaled proportionally to Earth radius

### Radiation Effects
Satellites closer to the Sun experience more degradation:
- **Inverse square law** applies to radiation intensity
- **Real-time calculation** affects satellite health
- **Visual feedback** through color changes and solar panel brightness

## User Interactions

### Controls
- **Rotate**: Left-click + drag
- **Pan**: Right-click + drag
- **Zoom**: Mouse scroll wheel
- **Reset**: Double-click

### Views
1. **Dashboard View**: Integrated 600px height panel
2. **Full-Screen 3D View**: Dedicated page at `/3d-view` route

### Information Display
- Satellite labels with health percentage
- Orbital path visualization (gray dotted lines)
- Real-time data overlay panel (in full-screen view)

## Performance Considerations

- **Optimized geometry**: Lower polygon counts for distant objects
- **Efficient updates**: Frame-based calculations with throttling
- **Particle system**: Limited to 100-1000 particles based on intensity
- **HTML labels**: Rendered only when visible

## Color Coding System

### Satellite Health
- 🟢 Green (80-100%): Healthy
- 🟡 Yellow (50-80%): Minor degradation
- 🟠 Orange (20-50%): Significant degradation
- 🔴 Red (0-20%): Critical condition

### Magnetic Field
- 🔵 Blue: Normal/positive Bz
- 🔴 Red: Compressed/negative Bz (storm conditions)

### Radiation Level
- 🟢 Green (0-5): Low
- 🟡 Yellow (5-10): Moderate
- 🟠 Orange (10-15): High
- 🔴 Red (15+): Extreme

## API Integration

### Endpoints Used
```
GET /api/current-conditions
- Returns: bz, speed, density, pressure, xray_flux, proton_flux

WebSocket /ws
- Real-time updates for all parameters
```

### Data Flow
```
Backend ML Models → API → Frontend State → 3D Scene → Visual Updates
```

## Future Enhancements

### Planned Features
1. **Time acceleration**: Speed up orbital periods for demonstration
2. **Satellite selection**: Click satellites for detailed information
3. **Historical playback**: Replay past solar storm events
4. **More satellites**: Add additional satellite types (military, commercial)
5. **CME visualization**: Show Coronal Mass Ejections
6. **Aurora effects**: Visualize auroral oval on Earth
7. **Radiation belts**: Van Allen belt visualization

### Technical Improvements
1. **Level of Detail (LOD)**: Reduce detail for distant objects
2. **Instanced rendering**: Better performance for multiple satellites
3. **Shader effects**: Custom GLSL shaders for better visuals
4. **Texture mapping**: Realistic Earth and Sun textures
5. **Bloom effects**: Post-processing for glowing objects

## Dependencies

```json
{
  "@react-three/fiber": "^8.15.16",
  "@react-three/drei": "^9.88.17",
  "three": "0.158.0",
  "framer-motion": "^10.16.16"
}
```

## Usage Example

```tsx
import SolarSystemVisualization from './components/SolarSystemVisualization';

<SolarSystemVisualization
  radiationLevel={12.5}
  bzValue={-8.3}
  solarWindSpeed={550}
  protonFlux={15.0}
  xrayFlux={1.5e-5}
  magneticFieldStrength={0.85}
  onSatelliteUpdate={(satellites) => {
    console.log('Updated satellites:', satellites);
  }}
/>
```

## Troubleshooting

### Common Issues

1. **Black screen**: Check Three.js version compatibility
2. **Low performance**: Reduce particle count or satellite detail
3. **WebGL errors**: Update graphics drivers
4. **Missing labels**: Check HTML overlay rendering

### Debug Mode
Enable console logging in the component for troubleshooting:
```typescript
console.log('Radiation:', radiationLevel);
console.log('Satellites:', satellites);
```

## Credits

- **Physics**: Based on real orbital mechanics and space weather science
- **Data**: NOAA Space Weather Prediction Center models
- **Visualization**: Three.js and React Three Fiber
- **Design**: Inspired by NASA and ESA space visualization tools

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Author**: SolarShield Development Team
