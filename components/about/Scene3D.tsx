'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

// Precomputed once at module load so the particle field is stable (no Math.random in render).
function buildParticlePositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.4 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

const PARTICLE_POSITIONS = buildParticlePositions(200);

function Centerpiece() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.15;
    mesh.current.rotation.x += delta * 0.04;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial
          color="#2c4c7e"
          emissive="#2c4c7e"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.2}
          flatShading
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[PARTICLE_POSITIONS, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#2c4c7e"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

export function Scene3D() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    // Static fallback — never mount heavy WebGL for reduced-motion users.
    return (
      <div
        className="h-full w-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(44,76,126,0.35) 0%, rgba(44,76,126,0.08) 35%, transparent 70%)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.2} />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#2c4c7e" />
      <Centerpiece />
      <Particles />
    </Canvas>
  );
}

export default Scene3D;
