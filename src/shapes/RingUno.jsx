import React, { useMemo } from 'react';
import { Center } from '@react-three/drei';
import * as THREE from 'three';

export const shapeConfig = {
    topCornerRadius: { value: 0, min: 0, max: 100 },
    bottomCornerRadius: { value: 0, min: 0, max: 100 },
    width: { value: 2, min: 0.1, max: 10 },
    height: { value: 1, min: 0.1, max: 10 },
    ellipseRadius: { value: 2.2, min: 0, max: 10 }
};


function createShapeGeometry(topCornerRadius, bottomCornerRadius, width, height, ellipseRadius) {

    let actualTopCornerRadius = Math.min(topCornerRadius / 50, width / 2, Math.abs(height - bottomCornerRadius / 50));
    let actualBottomCornerRadius = Math.min(bottomCornerRadius / 50, width / 2, Math.abs(height - topCornerRadius / 50));

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

const RingUno = React.memo(({ topCornerRadius, bottomCornerRadius, width, height, ellipseRadius, material }) => {
    const geometry = useMemo(() => createShapeGeometry(topCornerRadius, bottomCornerRadius, width, height, ellipseRadius), [topCornerRadius, bottomCornerRadius, width, height, ellipseRadius]);
    return <Center><mesh geometry={geometry} material={material} castShadow receiveShadow /></Center>;
});

export default RingUno;