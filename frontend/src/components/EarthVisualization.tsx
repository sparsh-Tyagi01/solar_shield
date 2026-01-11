import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

interface EarthProps {
  data?: any;
  onSatelliteUpdate?: (satellites: SatelliteData[]) => void;
}

interface SatelliteData {
  id: string;
  name: string;
  angle: number;
  radius: number;
  health: number;
  altitude: number;
  type: 'GPS' | 'Communication' | 'Weather' | 'ISS';
  degradation: number;
}

// Component to show the affected region (footprint) on Earth
const AffectedRegion: React.FC<{ 
  position: THREE.Vector3; 
  satelliteRadius: number;
  satelliteType: string;
  health: number;
}> = ({ position, satelliteRadius, satelliteType, health }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate footprint size based on satellite altitude
  const footprintSize = satelliteRadius * 0.4; // Proportional to altitude
  
  // Project satellite position onto Earth surface
  const earthSurface = position.clone().normalize();
  
  // Color based on satellite health and type
  const getFootprintColor = () => {
    if (health < 50) return '#ff3333'; // Red for critical
    if (health < 80) return '#ffaa00'; // Orange for degraded
    return satelliteType === 'ISS' ? '#00ff88' : 
           satelliteType === 'GPS' ? '#4444ff' :
           satelliteType === 'Communication' ? '#ff44ff' :
           '#44ffff'; // Cyan for weather
  };

  useFrame(() => {
    if (meshRef.current) {
      // Make the footprint pulse
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh 
      ref={meshRef}
      position={earthSurface.multiplyScalar(1.01)}
      rotation={[
        Math.atan2(earthSurface.y, Math.sqrt(earthSurface.x ** 2 + earthSurface.z ** 2)),
        Math.atan2(earthSurface.x, earthSurface.z),
        0
      ]}
    >
      <circleGeometry args={[footprintSize, 32]} />
      <meshBasicMaterial 
        color={getFootprintColor()}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// Component to show connection line from satellite to affected region
const SatelliteBeam: React.FC<{ 
  start: THREE.Vector3; 
  satelliteType: string;
  health: number;
}> = ({ start, satelliteType, health }) => {
  const earthPoint = start.clone().normalize();
  const points = [start, earthPoint];
  
  const beamColor = health < 50 ? '#ff3333' : 
                    health < 80 ? '#ffaa00' : 
                    satelliteType === 'ISS' ? '#00ff88' : '#44aaff';
  
  return (
    <Line
      points={points}
      color={beamColor}
      lineWidth={1}
      transparent
      opacity={0.3}
      dashed
      dashScale={2}
      dashSize={0.1}
      gapSize={0.05}
    />
  );
};

const Satellite: React.FC<{ 
  satellite: SatelliteData; 
  radiationLevel: number;
  onHealthUpdate: (id: string, health: number, degradation: number) => void;
}> = ({ satellite, radiationLevel, onHealthUpdate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const solarPanelRef = useRef<THREE.Mesh>(null);
  const [localDegradation, setLocalDegradation] = useState(satellite.degradation);
  const [health, setHealth] = useState(satellite.health);
  const [currentPosition, setCurrentPosition] = useState(new THREE.Vector3());

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const x = Math.cos(satellite.angle + time * 0.3) * satellite.radius;
      const z = Math.sin(satellite.angle + time * 0.3) * satellite.radius;
      const y = Math.sin(time * 0.2 + satellite.angle) * 0.3;
      
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.y = time * 0.5;
      setCurrentPosition(new THREE.Vector3(x, y, z));
      
      if (solarPanelRef.current) {
        solarPanelRef.current.position.set(x, y, z);
        solarPanelRef.current.rotation.y = time * 0.5;
      }
      
      // Calculate degradation based on radiation (more realistic)
      const degradationRate = radiationLevel * 0.002;
      const newDegradation = Math.min(100, localDegradation + degradationRate);
      const newHealth = Math.max(0, 100 - newDegradation * 0.8);
      
      if (Math.abs(newDegradation - localDegradation) > 0.1) {
        setLocalDegradation(newDegradation);
        setHealth(newHealth);
        onHealthUpdate(satellite.id, newHealth, newDegradation);
      }
    }
  });

  const healthColor = health > 80 ? '#00ff00' : 
                      health > 50 ? '#ffaa00' : 
                      health > 20 ? '#ff6600' : '#ff0000';

  return (
    <group>
      {/* Satellite body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial 
          color={healthColor} 
          emissive={healthColor}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Solar panels */}
      <mesh ref={solarPanelRef}>
        <boxGeometry args={[0.3, 0.02, 0.12]} />
        <meshStandardMaterial 
          color="#1e40af" 
          metalness={0.9}
          roughness={0.1}
          emissive="#0066ff"
          emissiveIntensity={Math.max(0, (100 - localDegradation) / 200)}
        />
      </mesh>
      
      {/* Antenna */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.01, 0.01, 0.15]} />
        <meshStandardMaterial color="#888888" metalness={1} />
      </mesh>
      
      {/* Show affected region on Earth */}
      <AffectedRegion 
        position={currentPosition}
        satelliteRadius={satellite.radius}
        satelliteType={satellite.type}
        health={health}
      />
      
      {/* Show beam connecting satellite to affected region */}
      <SatelliteBeam
        start={currentPosition}
        satelliteType={satellite.type}
        health={health}
      />
    </group>
  );
};

const SolarWindParticles: React.FC<{ intensity: number; speed: number; bzValue: number }> = 
  ({ intensity, speed, bzValue }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = Math.floor(Math.max(50, intensity * 2));

  useEffect(() => {
    if (particlesRef.current) {
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15 - 8;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        
        velocities[i * 3] = speed / 100;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 2] = bzValue < 0 ? -0.01 : 0.01;
      }
      
      particlesRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      particlesRef.current.geometry.setAttribute(
        'velocity',
        new THREE.BufferAttribute(velocities, 3)
      );
    }
  }, [particleCount, speed, bzValue]);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = particlesRef.current.geometry.attributes.velocity.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Reset particle if it goes too far
        if (positions[i] > 10) {
          positions[i] = -15;
          positions[i + 1] = (Math.random() - 0.5) * 8;
          positions[i + 2] = (Math.random() - 0.5) * 8;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleColor = intensity > 5 ? '#ff4444' : intensity > 3 ? '#ffaa00' : '#ffff00';

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial 
        size={0.08} 
        color={particleColor}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const Earth: React.FC<{ 
  bzValue?: number; 
  speed?: number; 
  density?: number;
  satellites: SatelliteData[];
  onSatelliteHealthUpdate: (id: string, health: number, degradation: number) => void;
}> = ({ bzValue = 0, speed = 400, density = 5, satellites, onSatelliteHealthUpdate }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const magnetosphereRef = useRef<THREE.Mesh>(null);
  const [glowIntensity, setGlowIntensity] = useState(0.2);
  
  // Create a more detailed Earth with continents
  const createEarthTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Ocean base
    ctx.fillStyle = '#1a4d7a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simplified continents (very basic representation)
    ctx.fillStyle = '#2d5a2d';
    
    // North America
    ctx.beginPath();
    ctx.ellipse(200, 180, 80, 100, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(250, 320, 50, 80, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(500, 150, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(530, 270, 70, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(700, 180, 120, 80, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(800, 360, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some cloud-like texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 30 + 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  };

  const earthTexture = createEarthTexture();

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
    
    // Pulsing glow based on solar activity
    const pulse = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    setGlowIntensity(0.2 + Math.abs(bzValue) / 100 + pulse);
  });

  const magnetosphereColor = bzValue < -10 ? '#ff4444' : 
                             bzValue < -5 ? '#ff8844' :
                             bzValue < 0 ? '#ffaa00' : '#4444ff';
  const magnetosphereScale = 1 + Math.abs(bzValue) / 40;
  const radiationLevel = Math.abs(bzValue) + (speed - 400) / 50 + density;

  return (
    <group>
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      
      {/* Earth with texture */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          map={earthTexture}
          emissive="#112255"
          emissiveIntensity={glowIntensity * 0.3}
          metalness={0.1}
          roughness={0.9}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.05, 32, 32]}>
        <meshStandardMaterial
          color="#6699ff"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Night lights effect on dark side */}
      <Sphere args={[1.001, 64, 64]}>
        <meshBasicMaterial
          color="#ffcc44"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Magnetosphere */}
      <Sphere 
        ref={magnetosphereRef} 
        args={[magnetosphereScale * 1.5, 32, 32]} 
        scale={[1.6, 1, 1]}
      >
        <meshStandardMaterial
          color={magnetosphereColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          emissive={magnetosphereColor}
          emissiveIntensity={0.3}
        />
      </Sphere>

      {/* Magnetic field lines */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const points = [];
        for (let j = 0; j <= 25; j++) {
          const t = j / 25;
          const r = 1 + t * (1.5 + Math.abs(bzValue) / 30);
          const z = Math.sin(t * Math.PI) * 0.6;
          const distortion = bzValue < 0 ? t * 0.2 : 0;
          points.push(
            new THREE.Vector3(
              Math.cos(angle) * r + distortion,
              z,
              Math.sin(angle) * r
            )
          );
        }
        return (
          <Line
            key={i}
            points={points}
            color={magnetosphereColor}
            lineWidth={1.5}
            transparent
            opacity={0.6}
          />
        );
      })}

      {/* Solar wind particles */}
      <SolarWindParticles 
        intensity={density} 
        speed={speed} 
        bzValue={bzValue}
      />
      
      {/* Radiation belt */}
      <Sphere args={[2.5, 32, 32]} scale={[1.2, 0.4, 1]}>
        <meshStandardMaterial
          color="#ff6600"
          transparent
          opacity={Math.min(0.3, radiationLevel / 50)}
          side={THREE.DoubleSide}
          emissive="#ff4400"
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Satellites */}
      {satellites.map((sat) => (
        <Satellite
          key={sat.id}
          satellite={sat}
          radiationLevel={radiationLevel}
          onHealthUpdate={onSatelliteHealthUpdate}
        />
      ))}
    </group>
  );
};

const EarthVisualization: React.FC<EarthProps> = ({ data, onSatelliteUpdate }) => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([
    { id: 'gps1', name: 'GPS-IIF-12', angle: 0, radius: 2.5, health: 100, altitude: 20200, type: 'GPS', degradation: 0 },
    { id: 'gps2', name: 'GPS-IIF-07', angle: Math.PI / 3, radius: 2.5, health: 100, altitude: 20200, type: 'GPS', degradation: 0 },
    { id: 'comm1', name: 'TDRS-13', angle: Math.PI * 2 / 3, radius: 4.2, health: 100, altitude: 35786, type: 'Communication', degradation: 0 },
    { id: 'comm2', name: 'Intelsat-39', angle: Math.PI, radius: 4.2, health: 100, altitude: 35786, type: 'Communication', degradation: 0 },
    { id: 'weather1', name: 'GOES-16', angle: Math.PI * 4 / 3, radius: 4.0, health: 100, altitude: 35786, type: 'Weather', degradation: 0 },
    { id: 'iss', name: 'ISS', angle: Math.PI * 5 / 3, radius: 1.7, health: 100, altitude: 408, type: 'ISS', degradation: 0 },
  ]);

  const handleSatelliteHealthUpdate = (id: string, health: number, degradation: number) => {
    setSatellites(prev => {
      const updated = prev.map(sat => 
        sat.id === id ? { ...sat, health, degradation } : sat
      );
      if (onSatelliteUpdate) {
        onSatelliteUpdate(updated);
      }
      return updated;
    });
  };

  return (
    <div className="relative w-full h-96">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
        <h4 className="text-sm font-bold text-white mb-2">Coverage Regions</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-300">GPS Coverage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-300">Communication</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span className="text-gray-300">Weather Monitor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-gray-300">ISS Coverage</span>
          </div>
          <div className="border-t border-gray-600 my-2 pt-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-300">Critical Health</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-gray-300">Degraded</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info panel */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
        <h4 className="text-sm font-bold text-white mb-1">Interactive View</h4>
        <p className="text-xs text-gray-400">Drag to rotate • Scroll to zoom</p>
        <p className="text-xs text-gray-400 mt-1">Colored regions show satellite coverage</p>
      </div>
      
      <Canvas camera={{ position: [0, 3, 6], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[-15, 5, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[5, -5, -5]} intensity={0.5} color="#4444ff" />
        <Earth 
          bzValue={data?.bz} 
          speed={data?.speed}
          density={data?.density}
          satellites={satellites}
          onSatelliteHealthUpdate={handleSatelliteHealthUpdate}
        />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={3}
          maxDistance={15}
        />
        <color attach="background" args={['#000000']} />
      </Canvas>
    </div>
  );
};

export default EarthVisualization;
