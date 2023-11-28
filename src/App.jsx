import React, { useMemo } from 'react';
import { useControls } from 'leva';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

const shapeConfig = {
  topCornerRadius: { value: 50, min: 0, max: 100 },
  bottomCornerRadius: { value: 50, min: 0, max: 100 },
  width: { value: 2, min: 0.1, max: 10 },
  height: { value: 1, min: 0.1, max: 10 },
  ellipseRadius: { value: 2.2, min: 0, max: 10 }
};

function createShapeGeometry(topCornerRadius, bottomCornerRadius, width, height, ellipseRadius) {
  const smallestDimension = Math.min(width, height);
  const actualTopCornerRadius = smallestDimension / 2 * Math.min(topCornerRadius, 100) / 100;
  const actualBottomCornerRadius = smallestDimension / 2 * Math.min(bottomCornerRadius, 100) / 100;

  const shape = new THREE.Shape();
  shape.moveTo(actualBottomCornerRadius, -height);
  shape.lineTo(width - actualBottomCornerRadius, -height);
  shape.absarc(width - actualBottomCornerRadius, -height + actualBottomCornerRadius, actualBottomCornerRadius, -Math.PI / 2, 0, false);
  shape.lineTo(width, -actualTopCornerRadius);
  shape.absarc(width - actualTopCornerRadius, -actualTopCornerRadius, actualTopCornerRadius, 0, Math.PI / 2, false);
  shape.lineTo(actualTopCornerRadius, 0);
  shape.absarc(actualTopCornerRadius, -actualTopCornerRadius, actualTopCornerRadius, Math.PI / 2, Math.PI, false);
  shape.lineTo(0, -height + actualBottomCornerRadius);
  shape.absarc(actualBottomCornerRadius, -height + actualBottomCornerRadius, actualBottomCornerRadius, Math.PI, 3 * Math.PI / 2, false);
  shape.closePath();

  const ellipseCurve = new THREE.EllipseCurve(0, 0, ellipseRadius, ellipseRadius);
  const pathPoints = ellipseCurve.getPoints(360);
  const extrudePath = new THREE.CatmullRomCurve3(pathPoints.map(p => new THREE.Vector3(p.x, p.y, 0)), true);
  return new THREE.ExtrudeGeometry(shape, { steps: 360, bevelEnabled: false, extrudePath });
}

const CustomShape = React.memo(({ topCornerRadius, bottomCornerRadius, width, height, ellipseRadius, material }) => {
  const geometry = useMemo(() => createShapeGeometry(topCornerRadius, bottomCornerRadius, width, height, ellipseRadius), [topCornerRadius, bottomCornerRadius, width, height, ellipseRadius]);
  return <Center><mesh geometry={geometry} material={material} castShadow receiveShadow /></Center>;
});

export default function App() {
  const { topCornerRadius, bottomCornerRadius, width, height, ellipseRadius } = useControls('Shape', shapeConfig);
  const { color, roughness, metalness } = useControls('Material', {
    color: '#ffda5e',
    roughness: { value: 0.1, min: 0, max: 1 },
    metalness: { value: 1, min: 0, max: 1 }
  });

  const customMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness, metalness }), [color, roughness, metalness]);

  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 35 }}>
      <CustomShape topCornerRadius={topCornerRadius} bottomCornerRadius={bottomCornerRadius} width={width} height={height} ellipseRadius={ellipseRadius} material={customMaterial} />
      <Environment preset="dawn" background blur={0.35} />
      <OrbitControls autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
