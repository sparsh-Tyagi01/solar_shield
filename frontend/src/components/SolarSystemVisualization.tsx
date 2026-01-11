import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Html, Line, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface SolarSystemProps {
  radiationLevel: number;
  bzValue: number;
  solarWindSpeed: number;
  protonFlux: number;
  xrayFlux: number;
  magneticFieldStrength: number;
  onSatelliteUpdate?: (satellites: SatelliteData[]) => void;
}

interface SatelliteData {
  id: string;
  name: string;
  type: 'GPS' | 'Communication' | 'Weather' | 'ISS' | 'Research' | 'Military';
  health: number;
  degradation: number;
  altitude: number; // km
  orbitalPeriod: number; // seconds for full orbit
  inclination: number; // orbital inclination in radians
  phase: number; // starting phase
}

// Sun component with dynamic radiation visualization
const Sun: React.FC<{ radiationLevel: number; xrayFlux: number }> = ({ radiationLevel, xrayFlux }) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const flareRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.1;
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.y = -time * 0.05;
      const pulsate = 1 + Math.sin(time * 2) * 0.15 * (radiationLevel / 10);
      coronaRef.current.scale.set(pulsate, pulsate, pulsate);
    }

    // Animate solar flares
    flareRefs.current.forEach((flare, i) => {
      if (flare) {
        const angle = (time * 0.5 + i * (Math.PI * 2 / 8)) % (Math.PI * 2);
        const intensity = Math.max(0, Math.sin(time * 3 + i));
        const scale = 0.3 + intensity * 0.5 * (radiationLevel / 10);
        flare.scale.set(scale * 0.2, scale * 2, scale * 0.2);
        
        const distance = 0.6;
        flare.position.set(
          Math.cos(angle) * distance,
          Math.sin(angle * 3) * 0.3,
          Math.sin(angle) * distance
        );
        flare.rotation.z = angle;
      }
    });
  });

  // Solar flare intensity based on X-ray flux
  const flareIntensity = Math.min(1, xrayFlux * 100000);
  const sunColor = new THREE.Color(1, 0.9 - flareIntensity * 0.3, 0.3);

  return (
    <group position={[0, 0, 0]}>
      {/* Sun core */}
      <Sphere ref={sunRef} args={[0.5, 64, 64]}>
        <meshBasicMaterial 
          color={sunColor}
          toneMapped={false}
        />
      </Sphere>

      {/* Corona - glowing atmosphere */}
      <Sphere ref={coronaRef} args={[0.65, 32, 32]}>
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.3 + radiationLevel * 0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Solar flares */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={`flare-${i}`}
          ref={(el) => {
            if (el) flareRefs.current[i] = el;
          }}
        >
          <coneGeometry args={[0.1, 2, 8]} />
          <meshBasicMaterial
            color="#ff6600"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Sunlight */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2 + radiationLevel * 0.3}
        distance={50}
        decay={2}
        color="#fff5e6"
      />

      {/* Extra glow for high radiation */}
      {radiationLevel > 7 && (
        <pointLight
          position={[0, 0, 0]}
          intensity={radiationLevel * 0.5}
          distance={30}
          color="#ff3300"
        />
      )}
    </group>
  );
};

// Earth with magnetic field visualization
const Earth: React.FC<{ 
  magneticFieldStrength: number; 
  bzValue: number;
  radiationLevel: number;
}> = ({ magneticFieldStrength, bzValue, radiationLevel }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.3;
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y = time * 0.35;
    }
  });

  // Earth position relative to Sun
  const earthDistance = 8;

  return (
    <group position={[earthDistance, 0, 0]}>
      {/* Earth */}
      <Sphere ref={earthRef} args={[0.4, 64, 64]}>
        <meshStandardMaterial
          color="#2563eb"
          emissive="#1e3a8a"
          emissiveIntensity={0.3}
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>

      {/* Clouds */}
      <Sphere ref={cloudRef} args={[0.405, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={1}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[0.45, 32, 32]}>
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Magnetic field lines */}
      <MagneticField 
        strength={magneticFieldStrength}
        bzValue={bzValue}
        radiationLevel={radiationLevel}
      />
    </group>
  );
};

// Magnetic field visualization
const MagneticField: React.FC<{
  strength: number;
  bzValue: number;
  radiationLevel: number;
}> = ({ strength, bzValue, radiationLevel }) => {
  const fieldLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const numLines = 8;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const line: THREE.Vector3[] = [];
      
      // Create dipole field line shape
      for (let t = 0; t <= 1; t += 0.05) {
        const latitude = (t - 0.5) * Math.PI;
        const r = 0.5 + Math.cos(latitude) ** 2 * (1 + strength * 0.3);
        
        const x = r * Math.cos(latitude) * Math.cos(angle);
        const y = r * Math.sin(latitude);
        const z = r * Math.cos(latitude) * Math.sin(angle);
        
        line.push(new THREE.Vector3(x, y, z));
      }
      
      lines.push(line);
    }

    return lines;
  }, [strength]);

  // Color based on magnetic field health and Bz value
  const fieldColor = bzValue < 0 
    ? new THREE.Color(0.8, 0.2, 0.2) // Red when Bz is negative (compressed)
    : new THREE.Color(0.2, 0.8, 1.0); // Blue when positive (normal)

  const opacity = Math.min(0.8, 0.3 + radiationLevel * 0.05);

  return (
    <group>
      {fieldLines.map((points, i) => (
        <Line
          key={`field-${i}`}
          points={points}
          color={fieldColor}
          lineWidth={2}
          transparent
          opacity={opacity}
        />
      ))}
    </group>
  );
};

// Moon with realistic orbit
const Moon: React.FC = () => {
  const moonRef = useRef<THREE.Mesh>(null);
  const orbitRadius = 1.2; // Relative to Earth

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (moonRef.current) {
      // Moon orbits around Earth position
      const earthX = 8;
      const moonAngle = time * 0.1; // Slow orbit
      
      moonRef.current.position.x = earthX + Math.cos(moonAngle) * orbitRadius;
      moonRef.current.position.z = Math.sin(moonAngle) * orbitRadius;
      moonRef.current.position.y = Math.sin(moonAngle * 0.5) * 0.1;
      
      moonRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <Sphere ref={moonRef} args={[0.1, 32, 32]}>
      <meshStandardMaterial
        color="#9ca3af"
        roughness={1}
        metalness={0}
      />
    </Sphere>
  );
};

// Satellite component with realistic behavior
const Satellite: React.FC<{
  satellite: SatelliteData;
  radiationLevel: number;
  onUpdate: (id: string, health: number, degradation: number) => void;
}> = ({ satellite, radiationLevel, onUpdate }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(satellite.health);
  const [degradation, setDegradation] = useState(satellite.degradation);

  // Convert altitude to scene units (Earth radius = 0.4, Earth = 6371 km)
  const earthRadius = 0.4;
  const earthRadiusKm = 6371;
  const orbitRadius = earthRadius + (satellite.altitude / earthRadiusKm) * 0.4;
  const earthX = 8; // Earth position

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Calculate orbital position
    const orbitalSpeed = (2 * Math.PI) / satellite.orbitalPeriod;
    const angle = satellite.phase + time * orbitalSpeed;
    
    const x = earthX + Math.cos(angle) * orbitRadius * Math.cos(satellite.inclination);
    const y = Math.sin(angle) * orbitRadius * Math.sin(satellite.inclination);
    const z = Math.sin(angle) * orbitRadius * Math.cos(satellite.inclination);
    
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.y = time;

    // Calculate degradation based on radiation exposure
    // Distance from Sun affects radiation intensity
    const distanceFromSun = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    const radiationFactor = 1 / (distanceFromSun * distanceFromSun);
    const degradationRate = radiationLevel * radiationFactor * 0.05; // Increased from 0.001 for visibility
    
    const newDegradation = Math.min(100, degradation + degradationRate);
    const newHealth = Math.max(0, 100 - newDegradation * 0.7);

    if (Math.abs(newHealth - health) > 0.1) { // More sensitive updates
      setHealth(newHealth);
      setDegradation(newDegradation);
      onUpdate(satellite.id, newHealth, newDegradation);
    }
  });

  const healthColor = health > 80 ? '#00ff00' : 
                      health > 50 ? '#ffaa00' : 
                      health > 20 ? '#ff6600' : '#ff0000';

  const sizeMultiplier = satellite.type === 'ISS' ? 1.5 : 1.0;

  return (
    <group ref={meshRef}>
      {/* Satellite body */}
      <mesh>
        <boxGeometry args={[0.06 * sizeMultiplier, 0.06 * sizeMultiplier, 0.1 * sizeMultiplier]} />
        <meshStandardMaterial
          color={healthColor}
          emissive={healthColor}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Solar panels */}
      <mesh position={[0.15 * sizeMultiplier, 0, 0]}>
        <boxGeometry args={[0.2 * sizeMultiplier, 0.01, 0.08 * sizeMultiplier]} />
        <meshStandardMaterial
          color="#1e40af"
          emissive="#0066ff"
          emissiveIntensity={Math.max(0, health / 200)}
          metalness={1}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[-0.15 * sizeMultiplier, 0, 0]}>
        <boxGeometry args={[0.2 * sizeMultiplier, 0.01, 0.08 * sizeMultiplier]} />
        <meshStandardMaterial
          color="#1e40af"
          emissive="#0066ff"
          emissiveIntensity={Math.max(0, health / 200)}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 0.08 * sizeMultiplier, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.1 * sizeMultiplier]} />
        <meshStandardMaterial color="#cccccc" metalness={1} />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.15 * sizeMultiplier, 0]} center>
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {satellite.name}
          <div className="text-[10px] text-gray-400">{Math.round(health)}%</div>
        </div>
      </Html>
    </group>
  );
};

// Solar radiation particles traveling from Sun to Earth
const SolarRadiation: React.FC<{ 
  intensity: number; 
  speed: number 
}> = ({ intensity, speed }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = Math.floor(intensity * 100);

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Start near the sun
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.7 + Math.random() * 0.3;
      
      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * distance;
      
      velocities[i] = 0.5 + Math.random() * 0.5;
    }

    return { positions, velocities };
  }, [particleCount]);

  useFrame(() => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      // Move particles towards Earth
      positions[i * 3] += (speed / 200) * particles.velocities[i];
      
      // Reset if too far
      if (positions[i * 3] > 10) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.7 + Math.random() * 0.3;
        positions[i * 3] = Math.cos(angle) * distance;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = Math.sin(angle) * distance;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ff6600"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Main Solar System Scene
const SolarSystemScene: React.FC<SolarSystemProps> = (props) => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [satellitesLoaded, setSatellitesLoaded] = useState(false);

  // Fetch satellite data from backend on mount
  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/satellites');
        const data = await response.json();
        console.log('SolarSystemVisualization: Fetched satellites from backend:', data.satellites);
        
        // Convert backend format to frontend format
        const formattedSatellites = data.satellites.map((sat: any) => ({
          id: sat.id,
          name: sat.name,
          type: sat.type,
          health: sat.health,
          degradation: sat.degradation,
          altitude: sat.altitude,
          orbitalPeriod: sat.orbitalPeriod,
          inclination: (sat.inclination * Math.PI) / 180, // Convert degrees to radians
          phase: (sat.phase * Math.PI) / 180
        }));
        
        setSatellites(formattedSatellites);
        setSatellitesLoaded(true);
      } catch (error) {
        console.error('Failed to fetch satellites from backend:', error);
        setSatellitesLoaded(false);
      }
    };
    
    fetchSatellites();
  }, []);

  const handleSatelliteUpdate = (id: string, health: number, degradation: number) => {
    setSatellites(prev => {
      const updated = prev.map(sat =>
        sat.id === id ? { ...sat, health, degradation } : sat
      );
      
      // Notify parent
      if (props.onSatelliteUpdate) {
        props.onSatelliteUpdate(updated);
      }
      
      return updated;
    });
  };

  // Notify parent on mount with initial satellites
  useEffect(() => {
    if (props.onSatelliteUpdate && satellites.length > 0) {
      console.log('SolarSystemVisualization: Sending initial satellites to parent, count:', satellites.length);
      props.onSatelliteUpdate(satellites);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satellitesLoaded]); // Only run when satellites are loaded

  // Show loading state if satellites not yet loaded
  if (!satellitesLoaded || satellites.length === 0) {
    return (
      <Html center>
        <div className="text-white text-center">
          <div className="text-2xl mb-2">🛰️</div>
          <div>Loading satellite fleet...</div>
          <div className="text-xs text-gray-400 mt-1">Fetching from backend</div>
        </div>
      </Html>
    );
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={60} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxDistance={30}
        minDistance={5}
      />

      <ambientLight intensity={0.2} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />

      {/* Sun */}
      <Sun 
        radiationLevel={props.radiationLevel} 
        xrayFlux={props.xrayFlux}
      />

      {/* Solar radiation particles */}
      <SolarRadiation 
        intensity={props.radiationLevel / 10}
        speed={props.solarWindSpeed}
      />

      {/* Earth with magnetic field */}
      <Earth
        magneticFieldStrength={props.magneticFieldStrength}
        bzValue={props.bzValue}
        radiationLevel={props.radiationLevel}
      />

      {/* Moon */}
      <Moon />

      {/* Satellites */}
      {satellites.map(satellite => (
        <Satellite
          key={satellite.id}
          satellite={satellite}
          radiationLevel={props.radiationLevel}
          onUpdate={handleSatelliteUpdate}
        />
      ))}

      {/* Orbital paths */}
      {satellites.map(satellite => {
        const earthRadius = 0.4;
        const earthRadiusKm = 6371;
        const orbitRadius = earthRadius + (satellite.altitude / earthRadiusKm) * 0.4;
        const points: THREE.Vector3[] = [];
        const earthX = 8;

        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          const x = earthX + Math.cos(angle) * orbitRadius * Math.cos(satellite.inclination);
          const y = Math.sin(angle) * orbitRadius * Math.sin(satellite.inclination);
          const z = Math.sin(angle) * orbitRadius * Math.cos(satellite.inclination);
          points.push(new THREE.Vector3(x, y, z));
        }

        return (
          <Line
            key={`orbit-${satellite.id}`}
            points={points}
            color="#666666"
            lineWidth={0.5}
            transparent
            opacity={0.3}
          />
        );
      })}
    </>
  );
};

// Main export component
export const SolarSystemVisualization: React.FC<SolarSystemProps> = (props) => {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <Canvas>
        <SolarSystemScene {...props} />
      </Canvas>
    </div>
  );
};

export default SolarSystemVisualization;
