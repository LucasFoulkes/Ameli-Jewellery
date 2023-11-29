import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import RingUno, { shapeConfig } from './shapes/RingUno';
import './App.css';

export default function App() {
  const shapeControls = useControls('Shape', shapeConfig);
  const materialControls = useControls('Material', {
    color: '#ffda5e',
    roughness: { value: 0.1, min: 0, max: 1 },
    metalness: { value: 1, min: 0, max: 1 }
  });

  const customMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: materialControls.color,
      roughness: materialControls.roughness,
      metalness: materialControls.metalness
    });
  }, [materialControls.color, materialControls.roughness, materialControls.metalness]);

  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 35 }}>
      <RingUno {...shapeControls} material={customMaterial} />
      <Environment preset="dawn" background blur={0.35} />
      <OrbitControls autoRotate autoRotateSpeed={0.1} />
    </Canvas>
  );
}
