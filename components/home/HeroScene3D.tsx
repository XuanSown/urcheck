'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { HeroScene3DFallback } from './HeroScene3DFallback';

const PRIMARY = '#ea580c';
const QR_DARK = '#111111';
const QR_LIGHT = '#ffffff';
const PRODUCT_URL = '/products/sample';

// Tạo texture QR-like một lần (anchor góc + finder pattern + ma trận ngẫu nhiên cố định).
function buildQrTexture(): THREE.CanvasTexture {
  const N = 21;
  const cell = 12;
  const size = N * cell;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = QR_LIGHT;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = QR_DARK;
  const finder = (x: number, y: number) => {
    ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = QR_LIGHT;
    ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = QR_DARK;
    ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell);
    ctx.fillStyle = QR_DARK;
  };
  // Ma trận ngẫu nhiên cố định (seed đơn giản để render ổn định).
  let seed = 1234567;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const inFinder =
        (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (inFinder) continue;
      if (rnd() > 0.55) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

function QrCube({ pointer, position = [0, 0, 0] }: { pointer: React.MutableRefObject<{ x: number; y: number }>; position?: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => buildQrTexture(), []);

  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    // Auto-rotate nền.
    mesh.current.rotation.y += delta * 0.15;
    // Parallax chuột: lerp góc lệch ±0.3 rad (pointer cập nhật từ wrapper).
    const targetX = pointer.current.y * 0.3;
    const targetZ = -pointer.current.x * 0.3;
    mesh.current.rotation.x += (targetX - mesh.current.rotation.x) * 0.06;
    mesh.current.rotation.z += (targetZ - mesh.current.rotation.z) * 0.06;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <boxGeometry args={[1.7, 1.7, 1.7]} />
        <meshStandardMaterial
          map={tex}
          color={QR_LIGHT}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

// Lọ mỹ phẩm 3D dựng từ primitive thuần three.js (không tải file ngoài).
const BOTTLE_PROFILE = [
  new THREE.Vector2(0.0, -0.62),
  new THREE.Vector2(0.30, -0.62),
  new THREE.Vector2(0.32, -0.56),
  new THREE.Vector2(0.32, 0.08),
  new THREE.Vector2(0.24, 0.22),
  new THREE.Vector2(0.13, 0.34),
  new THREE.Vector2(0.13, 0.5),
  new THREE.Vector2(0.0, 0.5),
];

function CosmeticBottle({
  pointer,
  onSelect,
  position = [0.95, 0, 0],
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  onSelect: () => void;
  position?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Auto-rotate nền, đồng bộ với QR.
    group.current.rotation.y += delta * 0.15;
    const targetX = pointer.current.y * 0.3;
    const targetZ = -pointer.current.x * 0.3;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06;
    group.current.rotation.z += (targetZ - group.current.rotation.z) * 0.06;
  });

  const onOver = () => {
    document.body.style.cursor = 'pointer';
  };
  const onOut = () => {
    document.body.style.cursor = '';
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1}>
      <group ref={group} position={position} scale={0.8} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
        {/* Thân thủy tinh */}
        <mesh>
          <latheGeometry args={[BOTTLE_PROFILE, 48]} />
          <meshPhysicalMaterial
            color="#eaf2f5"
            transmission={0.9}
            thickness={0.6}
            roughness={0.12}
            ior={1.45}
            transparent
            opacity={0.9}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
          />
        </mesh>
        {/* Dịch lỏng pha cam brand */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.27, 0.29, 0.55, 32]} />
          <meshStandardMaterial color={PRIMARY} roughness={0.3} transparent opacity={0.8} />
        </mesh>
        {/* Nắp */}
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.16, 32]} />
          <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// Vị trí hạt sinh một lần tại module scope (không gọi trong render).
const PARTICLES = (() => {
  const arr = new Float32Array(160 * 3);
  for (let i = 0; i < 160; i++) {
    const r = 2.4 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
})();

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = PARTICLES;
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={PRIMARY}
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

export function HeroScene3D() {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [mount, setMount] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setMount(!reducedMotion && mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [reducedMotion]);

  useEffect(() => {
    if (!mount) return;
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mount]);

  if (!mount || !webglOk) return <HeroScene3DFallback />;

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        if (!gl.getContext()) setWebglOk(false);
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.2} />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color={PRIMARY} />
      <QrCube pointer={pointer} position={[-0.7, 0, 0]} />
      <CosmeticBottle pointer={pointer} onSelect={() => router.push(PRODUCT_URL)} />
      <Particles />
    </Canvas>
  );
}

export default HeroScene3D;
