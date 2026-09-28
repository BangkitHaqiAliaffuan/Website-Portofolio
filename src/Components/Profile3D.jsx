import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/astronaut_glb.glb';

useGLTF.preload(modelUrl);

const IDLE_SPIN_SPEED = 0.2;
const MAX_YAW = 0.5;
const MAX_PITCH = 0.3;
const IDLE_MS = 1500;
const NEAR_PAD = 60;

const Astronaut = () => {
  const groupRef = useRef(null);
  const spinRef = useRef(0);
  const basePosRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef(0);
  const { scene } = useGLTF(modelUrl);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left - NEAR_PAD &&
        e.clientX <= rect.right + NEAR_PAD &&
        e.clientY >= rect.top - NEAR_PAD &&
        e.clientY <= rect.bottom + NEAR_PAD;
      if (!inside) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = THREE.MathUtils.clamp((e.clientX - cx) / (rect.width / 2), -1, 1);
      const ny = THREE.MathUtils.clamp((e.clientY - cy) / (rect.height / 2), -1, 1);

      mouseRef.current = { x: nx, y: ny };
      lastMoveRef.current = performance.now();
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [gl]);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    basePosRef.current = center.clone();
    group.position.copy(center).multiplyScalar(-1);
    group.scale.setScalar(0.9 / Math.max(size.y, 1e-6));
  }, [scene]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const active = performance.now() - lastMoveRef.current < IDLE_MS;
    if (!active) {
      spinRef.current += delta * IDLE_SPIN_SPEED;
    }

    const yawTarget = spinRef.current + (active ? mouseRef.current.x * MAX_YAW : 0);
    const pitchTarget = active ? -mouseRef.current.y * MAX_PITCH : 0;

    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, yawTarget, 3, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, pitchTarget, 3, delta);

    if (basePosRef.current) {
      const t = state.clock.elapsedTime;
      group.position.y = -basePosRef.current.y + Math.sin(t * 1.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
};

const Profile3D = () => {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{ fov: 35, position: [0, 0, 1.8] }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 3]} intensity={1.5} />
      <directionalLight position={[-3, 1, 2]} intensity={0.6} color="#9db8ff" />
      <directionalLight position={[0, -2, -3]} intensity={0.8} color="#5ef0ff" />
      <Suspense fallback={null}>
        <Astronaut />
      </Suspense>
    </Canvas>
  );
};

export default Profile3D;
