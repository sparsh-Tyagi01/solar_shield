import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AffectedRegion {
  lat: number;
  lon: number;
  radius: number;
  satelliteName: string;
  type: string;
  health: number;
}

interface SatelliteData {
  id: string;
  name: string;
  health: number;
  altitude: number;
  type: string;
  degradation: number;
}

interface AffectedRegionsMapProps {
  satellites: SatelliteData[];
  kpIndex?: number;
  stormSeverity?: number;
}

const AffectedRegionsMap: React.FC<AffectedRegionsMapProps> = ({ satellites, kpIndex = 3, stormSeverity = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSatellite, setHoveredSatellite] = React.useState<AffectedRegion | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Calculate affected regions based on satellite positions
  const calculateAffectedRegions = (): AffectedRegion[] => {
    if (!satellites || satellites.length === 0) return [];
    
    // Simulate realistic satellite coverage based on altitude and type
    const regions: AffectedRegion[] = [];
    
    satellites.forEach((sat, index) => {
      let lon: number;
      let lat: number;
      let radius: number;
      
      // Different orbital patterns based on satellite type
      if (sat.type === 'GPS') {
        // GPS satellites in MEO orbits - 6 orbital planes
        const plane = index % 6;
        const posInPlane = Math.floor(index / 6);
        lon = (plane * 60 + posInPlane * 30 - 180) % 360;
        lat = Math.sin((posInPlane * 0.8 + plane * 0.5)) * 55;
        radius = 35; // Medium coverage
      } else if (sat.type === 'Communication') {
        // Communication satellites - mix of GEO and LEO
        if (sat.altitude > 30000) {
          // GEO satellites - along equator
          lon = (index * 45 - 180) % 360;
          lat = 0 + (Math.random() - 0.5) * 10;
          radius = 50; // Large coverage
        } else {
          // LEO communication (like Starlink)
          lon = ((index * 37 + Date.now() * 0.001) % 360) - 180;
          lat = Math.sin(index * 1.7) * 70;
          radius = 25; // Smaller coverage
        }
      } else if (sat.type === 'Weather') {
        // Weather satellites - polar and geostationary
        if (sat.altitude > 30000) {
          // Geostationary weather satellites
          lon = (index * 90 - 135) % 360;
          lat = 0;
          radius = 45;
        } else {
          // Polar orbiting weather satellites
          lon = ((index * 60 + Date.now() * 0.002) % 360) - 180;
          lat = 60 * (index % 2 === 0 ? 1 : -1);
          radius = 30;
        }
      } else if (sat.type === 'ISS') {
        // ISS in LEO with ~51.6° inclination
        const time = Date.now() * 0.001;
        lon = ((time * 5 + index * 20) % 360) - 180;
        lat = Math.sin(time * 0.5 + index) * 51.6;
        radius = 20; // Small coverage area
      } else {
        // Default distribution for unknown types
        lon = (index * 60 - 180) % 360;
        lat = Math.sin(index * 1.2) * 60;
        radius = 25;
      }
      
      // Ensure longitude is within -180 to 180
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;
      
      regions.push({
        lat,
        lon,
        radius,
        satelliteName: sat.name,
        type: sat.type,
        health: sat.health
      });
    });
    
    return regions;
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw world map background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0a1628');
    bgGradient.addColorStop(0.5, '#1a2845');
    bgGradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines with labels
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(150, 180, 220, 0.4)';

    // Latitude lines with labels
    for (let i = 0; i <= 6; i++) {
      const y = (i / 6) * height;
      const lat = 90 - (i * 30);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`${lat}°`, 5, y - 3);
    }

    // Longitude lines with labels
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * width;
      const lon = -180 + (i * 30);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillText(`${lon}°`, x + 3, height - 5);
    }

    // Draw continents with better shapes and colors
    const landGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    landGradient.addColorStop(0, '#2d5a3d');
    landGradient.addColorStop(1, '#1a3a2a');
    ctx.fillStyle = landGradient;
    
    // North America (more detailed)
    ctx.beginPath();
    ctx.ellipse(width * 0.22, height * 0.28, 50, 60, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.26, height * 0.38, 45, 55, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Central America
    ctx.beginPath();
    ctx.ellipse(width * 0.265, height * 0.48, 15, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(width * 0.54, height * 0.28, 45, 25, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia (larger, more detailed)
    ctx.beginPath();
    ctx.ellipse(width * 0.68, height * 0.3, 90, 50, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.72, height * 0.42, 65, 40, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(width * 0.545, height * 0.52, 48, 68, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(width * 0.3, height * 0.63, 38, 65, 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(width * 0.78, height * 0.68, 42, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Antarctica
    ctx.fillStyle = 'rgba(200, 220, 240, 0.3)';
    ctx.fillRect(0, height * 0.85, width, height * 0.15);

    // Draw major cities as reference points
    const cities = [
      { name: 'New York', lat: 40.7, lon: -74 },
      { name: 'London', lat: 51.5, lon: -0.1 },
      { name: 'Tokyo', lat: 35.7, lon: 139.7 },
      { name: 'Sydney', lat: -33.9, lon: 151.2 },
      { name: 'Moscow', lat: 55.8, lon: 37.6 },
      { name: 'Beijing', lat: 39.9, lon: 116.4 },
      { name: 'Los Angeles', lat: 34.1, lon: -118.2 },
      { name: 'São Paulo', lat: -23.5, lon: -46.6 },
      { name: 'Mumbai', lat: 19.1, lon: 72.9 },
      { name: 'Dubai', lat: 25.3, lon: 55.3 },
    ];

    cities.forEach(city => {
      const x = ((city.lon + 180) / 360) * width;
      const y = ((90 - city.lat) / 180) * height;
      
      // Draw city marker
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw city name
      ctx.font = 'bold 9px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(city.name, x + 5, y - 3);
    });

    // Draw aurora zones based on Kp index
    // Higher Kp = aurora visible at lower latitudes
    const auroraLatitude = Math.max(50, 70 - (kpIndex * 3));
    
    // Northern aurora zone
    const northAuroraGradient = ctx.createLinearGradient(0, 0, 0, height * 0.25);
    northAuroraGradient.addColorStop(0, `rgba(0, 255, 150, ${0.1 + kpIndex * 0.05})`);
    northAuroraGradient.addColorStop(1, 'rgba(0, 255, 150, 0)');
    
    ctx.fillStyle = northAuroraGradient;
    const northY = ((90 - auroraLatitude) / 180) * height;
    ctx.fillRect(0, 0, width, northY);
    
    // Southern aurora zone
    const southAuroraGradient = ctx.createLinearGradient(0, height * 0.75, 0, height);
    southAuroraGradient.addColorStop(0, 'rgba(0, 255, 150, 0)');
    southAuroraGradient.addColorStop(1, `rgba(0, 255, 150, ${0.1 + kpIndex * 0.05})`);
    
    ctx.fillStyle = southAuroraGradient;
    const southY = ((90 + auroraLatitude) / 180) * height;
    ctx.fillRect(0, southY, width, height - southY);
    
    // Draw aurora zone labels
    if (kpIndex >= 5) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = 'rgba(0, 255, 150, 0.8)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeText('AURORA ZONE', width / 2 - 50, northY + 15);
      ctx.fillText('AURORA ZONE', width / 2 - 50, northY + 15);
    }

    // Draw affected regions
    const regions = calculateAffectedRegions();
    
    regions.forEach((region) => {
      // Convert lat/lon to canvas coordinates
      const x = ((region.lon + 180) / 360) * width;
      const y = ((90 - region.lat) / 180) * height;
      
      // Color based on health
      let color: string;
      let alpha: number;
      let pulseAlpha: number;
      
      if (region.health < 50) {
        color = '255, 50, 50'; // Red
        alpha = 0.6;
        pulseAlpha = 0.8;
      } else if (region.health < 80) {
        color = '255, 165, 0'; // Orange
        alpha = 0.5;
        pulseAlpha = 0.7;
      } else {
        color = '50, 200, 255'; // Cyan
        alpha = 0.4;
        pulseAlpha = 0.6;
      }
      
      // Draw coverage circle with gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, region.radius);
      gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
      gradient.addColorStop(0.7, `rgba(${color}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${color}, 0.1)`);
      
      ctx.beginPath();
      ctx.arc(x, y, region.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw border ring
      ctx.beginPath();
      ctx.arc(x, y, region.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color}, ${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw satellite marker with glow
      const markerGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      markerGradient.addColorStop(0, `rgba(${color}, 1)`);
      markerGradient.addColorStop(1, `rgba(${color}, 0.2)`);
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = markerGradient;
      ctx.fill();
      
      // Inner marker dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Pulsing effect for all satellites (stronger for critical)
      const pulse = 0.5 + Math.sin(Date.now() * 0.003 + region.lat) * 0.3;
      const pulseRadius = region.health < 50 ? 12 : 10;
      
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color}, ${pulse * pulseAlpha})`;
      ctx.lineWidth = region.health < 50 ? 3 : 2;
      ctx.stroke();
      
      // Draw satellite name on hover (show for critical satellites)
      if (region.health < 60) {
        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(region.satelliteName, x + 10, y - 10);
        ctx.fillText(region.satelliteName, x + 10, y - 10);
      }
    });

    // Draw legend with improved styling
    const legendX = width - 220;
    const legendY = 10;
    
    // Legend background
    const legendGradient = ctx.createLinearGradient(legendX, legendY, legendX, legendY + 100);
    legendGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    legendGradient.addColorStop(1, 'rgba(30, 41, 59, 0.85)');
    ctx.fillStyle = legendGradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(legendX, legendY, 210, 100);
    ctx.shadowBlur = 0;
    
    // Legend border
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(legendX, legendY, 210, 100);
    
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Satellite Coverage Status', legendX + 10, legendY + 20);
    
    // Healthy satellites
    ctx.beginPath();
    ctx.arc(legendX + 20, legendY + 40, 7, 0, Math.PI * 2);
    const healthyGradient = ctx.createRadialGradient(legendX + 20, legendY + 40, 0, legendX + 20, legendY + 40, 7);
    healthyGradient.addColorStop(0, 'rgba(50, 200, 255, 1)');
    healthyGradient.addColorStop(1, 'rgba(50, 200, 255, 0.3)');
    ctx.fillStyle = healthyGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(50, 200, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('Operational (>80%)', legendX + 35, legendY + 45);
    
    // Degraded satellites
    ctx.beginPath();
    ctx.arc(legendX + 20, legendY + 63, 7, 0, Math.PI * 2);
    const degradedGradient = ctx.createRadialGradient(legendX + 20, legendY + 63, 0, legendX + 20, legendY + 63, 7);
    degradedGradient.addColorStop(0, 'rgba(255, 165, 0, 1)');
    degradedGradient.addColorStop(1, 'rgba(255, 165, 0, 0.3)');
    ctx.fillStyle = degradedGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('Degraded (50-80%)', legendX + 35, legendY + 68);
    
    // Critical satellites
    ctx.beginPath();
    ctx.arc(legendX + 20, legendY + 86, 7, 0, Math.PI * 2);
    const criticalGradient = ctx.createRadialGradient(legendX + 20, legendY + 86, 0, legendX + 20, legendY + 86, 7);
    criticalGradient.addColorStop(0, 'rgba(255, 50, 50, 1)');
    criticalGradient.addColorStop(1, 'rgba(255, 50, 50, 0.3)');
    ctx.fillStyle = criticalGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('Critical (<50%)', legendX + 35, legendY + 91);
    
    // Draw statistics box
    const statsX = 10;
    const statsY = 10;
    const statsGradient = ctx.createLinearGradient(statsX, statsY, statsX, statsY + 80);
    statsGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    statsGradient.addColorStop(1, 'rgba(30, 41, 59, 0.85)');
    ctx.fillStyle = statsGradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(statsX, statsY, 180, 80);
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(statsX, statsY, 180, 80);
    
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Fleet Statistics', statsX + 10, statsY + 20);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#e0e0e0';
    const totalSats = regions.length;
    const operational = regions.filter(r => r.health > 80).length;
    const degraded = regions.filter(r => r.health > 50 && r.health <= 80).length;
    const critical = regions.filter(r => r.health <= 50).length;
    
    ctx.fillText(`Total Satellites: ${totalSats}`, statsX + 15, statsY + 40);
    ctx.fillStyle = '#50d0ff';
    ctx.fillText(`● Operational: ${operational}`, statsX + 15, statsY + 56);
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`● Degraded: ${degraded}`, statsX + 15, statsY + 68);
    ctx.fillStyle = '#ff3232';
    ctx.fillText(`● Critical: ${critical}`, statsX + 15, statsY + 80);
    
    // Draw timestamp
    const now = new Date();
    const timeString = now.toUTCString();
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
    ctx.fillText(`Last Update: ${timeString}`, width - 300, height - 8);
  };

  useEffect(() => {
    console.log('AffectedRegionsMap: Satellites updated, count:', satellites.length);
    drawMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satellites, hoveredSatellite]);

  // Animation loop for pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      drawMap();
    }, 50);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satellites, hoveredSatellite]);

  // Handle mouse movement for tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Check if mouse is over any satellite
    const regions = calculateAffectedRegions();
    let found = false;

    for (const region of regions) {
      const satX = ((region.lon + 180) / 360) * canvas.width;
      const satY = ((90 - region.lat) / 180) * canvas.height;
      const distance = Math.sqrt((x - satX) ** 2 + (y - satY) ** 2);

      if (distance < 15) {
        setHoveredSatellite(region);
        found = true;
        break;
      }
    }

    if (!found) {
      setHoveredSatellite(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSatellite(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg"
    >
      {satellites.length === 0 ? (
        <div className="w-full h-96 flex items-center justify-center bg-space-300/30 rounded-lg radar-grid">
          <div className="text-center">
            <div className="text-4xl mb-2">🛰️</div>
            <div className="data-value text-xl">Waiting for satellite data...</div>
            <div className="text-xs text-space-50 mt-2 font-mono">Data will appear once satellites are tracked</div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
            <canvas
              ref={canvasRef}
              width={1200}
              height={600}
              className="w-full h-full rounded-lg border border-cyber-cyan/30 shadow-xl cursor-crosshair"
              style={{ imageRendering: 'auto' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            
            {/* Tooltip for hovered satellite */}
            {hoveredSatellite && (
              <div
                className="absolute mission-panel p-3 shadow-xl pointer-events-none z-10 border-cyber-cyan"
                style={{
                  left: `${mousePos.x + 15}px`,
                  top: `${mousePos.y + 15}px`,
                }}
              >
                <div className="text-sm font-bold text-cyber-cyan mb-2">
                  {hoveredSatellite.satelliteName}
                </div>
                <div className="text-xs text-space-50 space-y-1 font-mono">
                  <div>TYPE: <span className="text-cyber-cyan-bright font-semibold">{hoveredSatellite.type}</span></div>
                  <div>HEALTH: <span className={
                    hoveredSatellite.health > 80 ? 'text-cyber-green font-semibold' :
                    hoveredSatellite.health > 50 ? 'text-solar-400 font-semibold' :
                    'text-cyber-red font-semibold'
                  }>{hoveredSatellite.health.toFixed(1)}%</span></div>
                  <div>LAT/LON: <span className="text-cyber-cyan-bright font-semibold">
                    {hoveredSatellite.lat.toFixed(2)}° / {hoveredSatellite.lon.toFixed(2)}°
                  </span></div>
                  <div>COVERAGE: <span className="text-cyber-cyan-bright font-semibold">{(hoveredSatellite.radius * 100).toFixed(0)} km</span></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {satellites.map((sat) => (
              <div key={sat.id} className="flex items-center space-x-2 mission-panel px-2 py-1.5">
                <div 
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    sat.health > 80 ? 'bg-cyber-green' :
                    sat.health > 50 ? 'bg-solar-400' :
                    'bg-cyber-red'
                  }`}
                />
                <span className="truncate font-mono text-space-50">{sat.name}</span>
                <span className={`ml-auto font-mono font-semibold ${
                  sat.health > 80 ? 'text-cyber-green' :
                  sat.health > 50 ? 'text-solar-400' :
                  'text-cyber-red'
                }`}>
                  {sat.health.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          {/* Map Legend */}
          <div className="mt-4 mission-panel p-4">
            <h3 className="text-sm font-display font-bold text-cyber-cyan uppercase tracking-wider mb-3">
              Map Legend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-cyber-green opacity-50"></div>
                <span className="text-space-50">Healthy Satellite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-solar-400 opacity-50"></div>
                <span className="text-space-50">Degraded Satellite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-cyber-red opacity-50"></div>
                <span className="text-space-50">Critical Satellite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-b from-green-400 to-transparent opacity-50"></div>
                <span className="text-space-50">Aurora Zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-white opacity-40"></div>
                <span className="text-space-50">Major Cities</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full border-2 border-cyber-cyan opacity-50"></div>
                <span className="text-space-50">Coverage Area</span>
              </div>
            </div>
            {kpIndex >= 5 && (
              <div className="mt-3 pt-3 border-t border-cyber-cyan/20">
                <p className="text-xs text-cyber-cyan font-mono">
                  ⚠️ HIGH GEOMAGNETIC ACTIVITY • Kp Index: {kpIndex.toFixed(1)} • Aurora visible at lower latitudes
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AffectedRegionsMap;
