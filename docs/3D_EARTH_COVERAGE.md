# 3D Earth with Satellite Coverage Visualization

## Overview
The enhanced 3D Earth visualization now displays affected regions on Earth's surface based on satellite positions and coverage areas.

## Features

### 1. **Realistic Earth Globe**
- Textured surface with simplified continents and oceans
- Rotating globe animation
- Atmospheric glow effect
- Night lights simulation on the dark side
- Dynamic lighting based on solar activity

### 2. **Satellite Coverage Footprints**
Each satellite projects a circular footprint on Earth's surface showing its coverage area:
- **Size**: Proportional to satellite altitude
- **Color**: Based on satellite type and health status
- **Animation**: Pulsing effect for visibility

### 3. **Coverage Color Coding**

#### By Satellite Type:
- **Blue (#4444ff)**: GPS satellites
- **Magenta (#ff44ff)**: Communication satellites
- **Cyan (#44ffff)**: Weather satellites
- **Green (#00ff88)**: ISS (International Space Station)

#### By Health Status:
- **Red (#ff3333)**: Critical health (< 50%)
- **Orange (#ffaa00)**: Degraded health (50-80%)
- **Normal colors**: Healthy satellites (> 80%)

### 4. **Satellite Connection Beams**
Dashed lines connect each satellite to its coverage area on Earth, showing:
- Real-time satellite-to-ground link
- Color matches satellite health and type
- Semi-transparent for better visibility

### 5. **Interactive Controls**
- **Drag**: Rotate the Earth
- **Scroll**: Zoom in/out
- **Min distance**: 3 units
- **Max distance**: 15 units

### 6. **Visual Elements**

#### Magnetosphere
- Changes color based on solar wind Bz component
- Expands/contracts with solar activity
- Magnetic field lines visualized

#### Solar Wind Particles
- Particle system showing solar wind flow
- Intensity based on solar activity
- Direction influenced by Bz value

#### Radiation Belts
- Van Allen radiation belt visualization
- Opacity increases with radiation levels
- Affects satellite health in real-time

## How It Works

### Coverage Calculation
```typescript
// Footprint size is proportional to satellite altitude
const footprintSize = satelliteRadius * 0.4;

// Position is projected onto Earth's surface
const earthSurface = position.clone().normalize();
```

### Health-Based Coloring
```typescript
const getFootprintColor = () => {
  if (health < 50) return '#ff3333';      // Critical
  if (health < 80) return '#ffaa00';      // Degraded
  return typeBasedColor;                  // Normal
};
```

### Real-Time Updates
- Satellite positions update continuously
- Health degradation calculated based on radiation exposure
- Coverage areas update in real-time with satellite movement

## UI Components

### Legend Panel (Top Left)
Shows color coding for:
- Different satellite types
- Health status indicators
- Quick reference guide

### Info Panel (Top Right)
Displays:
- Interactive controls help
- Coverage explanation
- Usage tips

## Technical Details

### Dependencies
- `@react-three/fiber`: 3D rendering engine
- `@react-three/drei`: Helper components
- `three.js`: Core 3D library

### Performance
- Optimized rendering with React Three Fiber
- Efficient particle systems
- Minimal re-renders with proper state management

### Customization
You can modify:
- Footprint sizes by adjusting the multiplier in `AffectedRegion`
- Colors in the `getFootprintColor()` function
- Animation speeds in `useFrame` hooks
- Earth texture in `createEarthTexture()`

## Usage Example

```tsx
import EarthVisualization from './components/EarthVisualization';

<EarthVisualization 
  data={{
    bz: -5,           // Solar wind Bz component
    speed: 450,       // Solar wind speed (km/s)
    density: 8        // Solar wind density
  }}
  onSatelliteUpdate={(satellites) => {
    // Handle satellite updates
    console.log('Updated satellites:', satellites);
  }}
/>
```

## Future Enhancements
- Add real satellite TLE data integration
- Show communication links between satellites
- Display ground station connections
- Add detailed coverage statistics
- Implement satellite orbit prediction
- Show historical coverage paths

## Satellite Data Structure
```typescript
interface SatelliteData {
  id: string;                                    // Unique identifier
  name: string;                                  // Satellite name
  angle: number;                                 // Orbital angle (radians)
  radius: number;                                // Orbital radius (scaled units)
  health: number;                                // Health percentage (0-100)
  altitude: number;                              // Real altitude (km)
  type: 'GPS' | 'Communication' | 'Weather' | 'ISS';
  degradation: number;                           // Degradation level (0-100)
}
```
