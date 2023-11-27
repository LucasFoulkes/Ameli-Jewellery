import React, { useState, useTransition, useMemo, useCallback } from 'react';
import { useControls } from 'leva';
import { Canvas } from '@react-three/fiber';
import { Center, AccumulativeShadows, RandomizedLight, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FlakesTexture } from 'three-stdlib';
import './App.css';

const cameraProps = { position: [0, 20, 20], fov: 50 };

function useCustomShapeGeometry(cornerRadius, width, height, ellipseRadius) {
  return useMemo(() => {
    // Calculate the actual corner radius as a percentage of the smaller of width or height
    const smallestDimension = Math.min(width, height);
    const validCornerRadius = Math.min(cornerRadius, 100);
    const actualCornerRadius = smallestDimension / 2 * (validCornerRadius / 100);

    // Construct the shape using actualCornerRadius
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

    // Ellipse curve and extrusion path
    const ellipseCurve = new THREE.EllipseCurve(0, 0, ellipseRadius, ellipseRadius, 0, 2 * Math.PI, false, 0);
    const pathPoints = ellipseCurve.getPoints(360);
    const extrudePath = new THREE.CatmullRomCurve3(pathPoints.map(p => new THREE.Vector3(p.x, p.y, 0)), true);
    const extrudeSettings = { steps: 360, bevelEnabled: false, extrudePath };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [cornerRadius, width, height, ellipseRadius]);
}


const CustomShape = React.memo(({ cornerRadius, width, height, materialProps, ellipseRadius }) => {
  const geometry = useCustomShapeGeometry(cornerRadius, width, height, ellipseRadius);

  return (
    <Center>
      <mesh geometry={geometry} material={materialProps} castShadow receiveShadow />
    </Center>
  );
});

function Env() {
  const [preset, setPreset] = useState('dawn');
  const [inTransition, startTransition] = useTransition();
  const handleChangePreset = useCallback((value) => {
    startTransition(() => setPreset(value));
  }, [startTransition]);

  const { blur } = useControls({
    blur: { value: 0.35, min: 0, max: 1 },
    preset: {
      value: preset,
      options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
      onChange: handleChangePreset
    }
  });

  return <Environment preset={preset} background blur={blur} />;
}

export default function App() {
  const { cornerRadius, width, height, ellipseRadius } = useControls('Geometry', {
    cornerRadius: { value: 50, min: 0, max: 100 },
    width: { value: 2, min: 0.1, max: 10 },
    height: { value: 1, min: 0.1, max: 10 },
    ellipseRadius: { value: 2.2, min: 0, max: 10 }
  });

  const { color, roughness, metalness } = useControls('Material', {
    color: '#ffda5e',
    roughness: { value: 0.1, min: 0, max: 1 },
    metalness: { value: 1, min: 0, max: 1 }
  });

  const materialProps = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness, metalness }), [color, roughness, metalness]);

  return (
    <Canvas shadows camera={cameraProps} id='canvas'>
      <group rotation={[Math.PI / 2, 1, 0]}>
        <CustomShape cornerRadius={cornerRadius} width={width} height={height} materialProps={materialProps} ellipseRadius={ellipseRadius} />
        <Env />
      </group>
      <OrbitControls autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}