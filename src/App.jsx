import React, { useState, useMemo } from 'react';
import { useControls } from 'leva';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

function createShapeGeometry(cornerRadius, width, height, ellipseRadius) {
  const smallestDimension = Math.min(width, height);
  const actualCornerRadius = smallestDimension / 2 * Math.min(cornerRadius, 100) / 100;

  const shape = new THREE.Shape();
  shape.moveTo(actualCornerRadius, -height);
  shape.lineTo(width - actualCornerRadius, -height);
  shape.absarc(width - actualCornerRadius, -height + actualCornerRadius, actualCornerRadius, -Math.PI / 2, 0, false);
  shape.lineTo(width, -actualCornerRadius);
  shape.absarc(width - actualCornerRadius, -actualCornerRadius, actualCornerRadius, 0, Math.PI / 2, false);
  shape.lineTo(actualCornerRadius, 0);
  shape.absarc(actualCornerRadius, -actualCornerRadius, actualCornerRadius, Math.PI / 2, Math.PI, false);
  shape.lineTo(0, -height + actualCornerRadius);
  shape.absarc(actualCornerRadius, -height + actualCornerRadius, actualCornerRadius, Math.PI, 3 * Math.PI / 2, false);
  shape.closePath();

  const ellipseCurve = new THREE.EllipseCurve(0, 0, ellipseRadius, ellipseRadius);
  const pathPoints = ellipseCurve.getPoints(360);
  const extrudePath = new THREE.CatmullRomCurve3(pathPoints.map(p => new THREE.Vector3(p.x, p.y, 0)), true);
  return new THREE.ExtrudeGeometry(shape, { steps: 360, bevelEnabled: false, extrudePath });
}

const CustomShape = React.memo(({ cornerRadius, width, height, ellipseRadius, material }) => {
  const geometry = useMemo(() => createShapeGeometry(cornerRadius, width, height, ellipseRadius), [cornerRadius, width, height, ellipseRadius]);
  return <Center><mesh geometry={geometry} material={material} castShadow receiveShadow /></Center>;
});

function useCustomMaterial() {
  const { color, roughness, metalness } = useControls('Material', {
    color: '#ffda5e',
    roughness: { value: 0.1, min: 0, max: 1 },
    metalness: { value: 1, min: 0, max: 1 }
  });
  return useMemo(() => new THREE.MeshStandardMaterial({ color, roughness, metalness }), [color, roughness, metalness]);
}

export default function App() {
  const { cornerRadius, width, height, ellipseRadius } = useControls('Geometry', {
    cornerRadius: { value: 50, min: 0, max: 100 },
    width: { value: 2, min: 0.1, max: 10 },
    height: { value: 1, min: 0.1, max: 10 },
    ellipseRadius: { value: 2.2, min: 0, max: 10 }
  });

  const customMaterial = useCustomMaterial();

  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 35 }}>
      <CustomShape {...{ cornerRadius, width, height, ellipseRadius, material: customMaterial }} />
      <Environment preset="dawn" background blur={0.35} />
      <OrbitControls autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
