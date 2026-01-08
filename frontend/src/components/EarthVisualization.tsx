import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface EarthProps {
  data?: any;
}

const Earth: React.FC<{ bzValue?: number }> = ({ bzValue = 0 }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const magnetosphereRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  const magnetosphereColor = bzValue < -10 ? '#ff4444' : bzValue < 0 ? '#ffaa00' : '#4444ff';
  const magnetosphereScale = 1 + Math.abs(bzValue) / 50;

  return (
    <group>
      {/* Earth */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#2244aa"
          emissive="#112255"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Magnetosphere */}
      <Sphere ref={magnetosphereRef} args={[magnetosphereScale * 1.5, 32, 32]} scale={[1.5, 1, 1]}>
        <meshStandardMaterial
          color={magnetosphereColor}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </Sphere>

      {/* Magnetic field lines */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const points = [];
        for (let j = 0; j <= 20; j++) {
          const t = j / 20;
          const r = 1 + t * 1.5;
          const z = Math.sin(t * Math.PI) * 0.5;
          points.push(
            new THREE.Vector3(
              Math.cos(angle) * r,
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
            lineWidth={1}
            transparent
            opacity={0.5}
          />
        );
      })}

      {/* Solar wind particles */}
      <group>
        {[...Array(20)].map((_, i) => (
          <mesh
            key={i}
            position={[
              -5 + (i * 0.5),
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffff00" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const EarthVisualization: React.FC<EarthProps> = ({ data }) => {
  return (
    <div className="w-full h-96">
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[-10, 10, 5]} intensity={1} />
        <Earth bzValue={data?.bz} />
        <OrbitControls enableZoom={true} enablePan={false} />
        <color attach="background" args={['#000000']} />
      </Canvas>
    </div>
  );
};

export default EarthVisualization;
