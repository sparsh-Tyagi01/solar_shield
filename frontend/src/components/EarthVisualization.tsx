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

const Satellite: React.FC<{ 
  satellite: SatelliteData; 
  radiationLevel: number;
  onHealthUpdate: (id: string, health: number, degradation: number) => void;
}> = ({ satellite, radiationLevel, onHealthUpdate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const solarPanelRef = useRef<THREE.Mesh>(null);
  const [localDegradation, setLocalDegradation] = useState(satellite.degradation);
  const [health, setHealth] = useState(satellite.health);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const x = Math.cos(satellite.angle + time * 0.3) * satellite.radius;
      const z = Math.sin(satellite.angle + time * 0.3) * satellite.radius;
      const y = Math.sin(time * 0.2 + satellite.angle) * 0.3;
      
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.y = time * 0.5;
      
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
      
      {/* Earth */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#2244aa"
          emissive="#112255"
          emissiveIntensity={glowIntensity}
          metalness={0.2}
          roughness={0.8}
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
    <div className="w-full h-96">
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
