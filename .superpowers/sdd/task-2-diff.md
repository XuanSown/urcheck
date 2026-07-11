diff --git a/components/Hero.tsx b/components/Hero.tsx
index 75c3996..719df9b 100644
--- a/components/Hero.tsx
+++ b/components/Hero.tsx
@@ -1,10 +1,16 @@
 'use client';
 import React from 'react';
 import { motion, useReducedMotion } from 'framer-motion';
-import Image from 'next/image';
+import dynamic from 'next/dynamic';
 import { Button } from '@/components/ui/Button';
 import Link from 'next/link';
 import { useLocale } from '@/components/I18nProvider';
+import { HeroScene3DFallback } from '@/components/home/HeroScene3DFallback';
+
+const HeroScene3D = dynamic(() => import('@/components/home/HeroScene3D'), {
+  ssr: false,
+  loading: () => <HeroScene3DFallback />,
+});
 
 export function Hero({ onScan, onExplore }: { onScan?: () => void; onExplore?: () => void }) {
   const { t } = useLocale();
@@ -36,9 +42,9 @@ export function Hero({ onScan, onExplore }: { onScan?: () => void; onExplore?: (
           </motion.div>
         </div>
         <motion.div {...rise()} className="relative">
-          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[4/3] lg:aspect-square">
-            <Image src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80" alt="Mỹ phẩm chính hãng được xác thực" fill sizes="(max-width:1024px) 90vw, 45vw" className="object-cover" priority />
-            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent" />
+          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[4/3] lg:aspect-square bg-gradient-to-tr from-primary-500/10 to-transparent">
+            <HeroScene3D />
+            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent pointer-events-none" />
             <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 dark:text-white">
               <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Đã xác minh
diff --git a/components/home/HeroScene3D.tsx b/components/home/HeroScene3D.tsx
new file mode 100644
index 0000000..f295902
--- /dev/null
+++ b/components/home/HeroScene3D.tsx
@@ -0,0 +1,164 @@
+'use client';
+
+import { useEffect, useMemo, useRef, useState } from 'react';
+import { Canvas, useFrame } from '@react-three/fiber';
+import { Float } from '@react-three/drei';
+import { useReducedMotion } from 'framer-motion';
+import * as THREE from 'three';
+import { HeroScene3DFallback } from './HeroScene3DFallback';
+
+const PRIMARY = '#ea580c';
+
+// Tạo texture QR-like một lần (anchor góc + finder pattern + ma trận ngẫu nhiên cố định).
+function buildQrTexture(): THREE.CanvasTexture {
+  const N = 21;
+  const cell = 12;
+  const size = N * cell;
+  const canvas = document.createElement('canvas');
+  canvas.width = size;
+  canvas.height = size;
+  const ctx = canvas.getContext('2d')!;
+  ctx.fillStyle = '#ffffff';
+  ctx.fillRect(0, 0, size, size);
+  ctx.fillStyle = PRIMARY;
+  const finder = (x: number, y: number) => {
+    ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell);
+    ctx.fillStyle = '#ffffff';
+    ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell);
+    ctx.fillStyle = PRIMARY;
+    ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell);
+    ctx.fillStyle = PRIMARY;
+  };
+  // Ma trận ngẫu nhiên cố định (seed đơn giản để render ổn định).
+  let seed = 1234567;
+  const rnd = () => {
+    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
+    return seed / 0x7fffffff;
+  };
+  for (let y = 0; y < N; y++) {
+    for (let x = 0; x < N; x++) {
+      const inFinder =
+        (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
+      if (inFinder) continue;
+      if (rnd() > 0.55) ctx.fillRect(x * cell, y * cell, cell, cell);
+    }
+  }
+  finder(0, 0);
+  finder(N - 7, 0);
+  finder(0, N - 7);
+  const tex = new THREE.CanvasTexture(canvas);
+  tex.anisotropy = 4;
+  return tex;
+}
+
+function QrCube({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
+  const mesh = useRef<THREE.Mesh>(null);
+  const tex = useMemo(() => buildQrTexture(), []);
+
+  useFrame((_, delta) => {
+    if (!mesh.current) return;
+    // Auto-rotate nền.
+    mesh.current.rotation.y += delta * 0.15;
+    // Parallax chuột: lerp góc lệch ±0.3 rad (pointer cập nhật từ wrapper).
+    const targetX = pointer.current.y * 0.3;
+    const targetZ = -pointer.current.x * 0.3;
+    mesh.current.rotation.x += (targetX - mesh.current.rotation.x) * 0.06;
+    mesh.current.rotation.z += (targetZ - mesh.current.rotation.z) * 0.06;
+  });
+
+  return (
+    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1}>
+      <mesh ref={mesh}>
+        <boxGeometry args={[1.7, 1.7, 1.7]} />
+        <meshStandardMaterial
+          map={tex}
+          color={PRIMARY}
+          emissive={PRIMARY}
+          emissiveIntensity={0.35}
+          roughness={0.35}
+          metalness={0.15}
+        />
+      </mesh>
+    </Float>
+  );
+}
+
+// Vị trí hạt sinh một lần tại module scope (không gọi trong render).
+const PARTICLES = (() => {
+  const arr = new Float32Array(160 * 3);
+  for (let i = 0; i < 160; i++) {
+    const r = 2.4 + Math.random() * 1.6;
+    const theta = Math.random() * Math.PI * 2;
+    const phi = Math.acos(2 * Math.random() - 1);
+    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
+    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
+    arr[i * 3 + 2] = r * Math.cos(phi);
+  }
+  return arr;
+})();
+
+function Particles() {
+  const ref = useRef<THREE.Points>(null);
+  const positions = PARTICLES;
+  useFrame((_, delta) => {
+    if (ref.current) ref.current.rotation.y += delta * 0.03;
+  });
+  return (
+    <points ref={ref}>
+      <bufferGeometry>
+        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
+      </bufferGeometry>
+      <pointsMaterial
+        color={PRIMARY}
+        size={0.03}
+        sizeAttenuation
+        transparent
+        opacity={0.5}
+        depthWrite={false}
+      />
+    </points>
+  );
+}
+
+export function HeroScene3D() {
+  const reducedMotion = useReducedMotion();
+  const [mount, setMount] = useState(false);
+  const pointer = useRef({ x: 0, y: 0 });
+
+  useEffect(() => {
+    const mq = window.matchMedia('(min-width: 640px)');
+    const update = () => setMount(!reducedMotion && mq.matches);
+    update();
+    mq.addEventListener('change', update);
+    return () => mq.removeEventListener('change', update);
+  }, [reducedMotion]);
+
+  useEffect(() => {
+    if (!mount) return;
+    const onMove = (e: MouseEvent) => {
+      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
+      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
+    };
+    window.addEventListener('mousemove', onMove);
+    return () => window.removeEventListener('mousemove', onMove);
+  }, [mount]);
+
+  if (!mount) return <HeroScene3DFallback />;
+
+  return (
+    <Canvas
+      camera={{ position: [0, 0, 4], fov: 45 }}
+      dpr={[1, 2]}
+      gl={{ antialias: true, alpha: true }}
+      style={{ pointerEvents: 'none' }}
+    >
+      <ambientLight intensity={0.6} />
+      <directionalLight position={[3, 3, 3]} intensity={1.2} />
+      <pointLight position={[-3, -2, 2]} intensity={0.8} color={PRIMARY} />
+      <QrCube pointer={pointer} />
+      <Particles />
+    </Canvas>
+  );
+}
+
+export default HeroScene3D;
diff --git a/components/home/HeroScene3DFallback.tsx b/components/home/HeroScene3DFallback.tsx
new file mode 100644
index 0000000..3bb15a0
--- /dev/null
+++ b/components/home/HeroScene3DFallback.tsx
@@ -0,0 +1,32 @@
+const PRIMARY = '#ea580c';
+
+export function HeroScene3DFallback() {
+  return (
+    <div
+      className="h-full w-full flex items-center justify-center"
+      style={{
+        background:
+          'radial-gradient(circle at 50% 50%, rgba(234,88,12,0.35) 0%, rgba(234,88,12,0.08) 35%, transparent 70%)',
+      }}
+      aria-hidden="true"
+    >
+      <svg width="58%" viewBox="0 0 21 21" fill={PRIMARY} xmlns="http://www.w3.org/2000/svg">
+        <path d="M0 0h7v7H0zM2 2h3v3H2zM14 0h7v7h-7zM16 2h3v3h-3zM0 14h7v7H0zM2 16h3v3H2z" />
+        <rect x="8" y="0" width="2" height="2" />
+        <rect x="11" y="3" width="2" height="2" />
+        <rect x="0" y="8" width="2" height="2" />
+        <rect x="3" y="10" width="2" height="2" />
+        <rect x="8" y="8" width="2" height="2" />
+        <rect x="13" y="8" width="2" height="2" />
+        <rect x="18" y="10" width="2" height="2" />
+        <rect x="8" y="13" width="2" height="2" />
+        <rect x="11" y="18" width="2" height="2" />
+        <rect x="16" y="13" width="2" height="2" />
+        <rect x="13" y="16" width="2" height="2" />
+        <rect x="18" y="16" width="2" height="2" />
+      </svg>
+    </div>
+  );
+}
+
+export default HeroScene3DFallback;
