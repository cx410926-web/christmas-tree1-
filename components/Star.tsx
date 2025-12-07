import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { TreeState } from '../types';

interface StarProps {
  state: TreeState;
}

export const Star: React.FC<StarProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate Star Shape
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.5;

    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      // Start at Math.PI / 2 to point the first vertex straight up
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  // Positions
  const treePos = useMemo(() => new THREE.Vector3(0, CONFIG.TREE_HEIGHT / 2 + 0.8, 0), []);
  const scatterPos = useMemo(() => new THREE.Vector3(0, 25, 0), []); // Start high up

  // Animation state
  const progress = useRef(0);

  useFrame((stateObj, delta) => {
    if (!meshRef.current) return;

    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    progress.current = THREE.MathUtils.damp(progress.current, target, 1.2, delta);
    
    // Easing
    const t = progress.current < 0.5 
      ? 4 * progress.current * progress.current * progress.current 
      : 1 - Math.pow(-2 * progress.current + 2, 3) / 2;

    // Position Interp
    meshRef.current.position.lerpVectors(scatterPos, treePos, t);

    // Rotation: Spin wildly when scattered, stabilize when tree
    const time = stateObj.clock.getElapsedTime();
    if (state === TreeState.SCATTERED) {
       meshRef.current.rotation.y = time * 0.8;
       meshRef.current.rotation.z = Math.sin(time) * 0.3;
    } else {
       // Slow noble rotation when set
       meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, time * 0.2, 0.05);
       meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
       meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 25, 0]}>
      <extrudeGeometry 
        args={[
          starShape, 
          { 
            depth: 0.3, 
            bevelEnabled: true, 
            bevelThickness: 0.15, 
            bevelSize: 0.1, 
            bevelSegments: 4 
          }
        ]} 
      />
      <meshStandardMaterial 
        color={COLORS.GOLD_METALLIC}
        emissive={COLORS.GOLD_METALLIC}
        emissiveIntensity={1.5} // High glow for the star
        roughness={0.05}
        metalness={1}
      />
    </mesh>
  );
};