import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { getTreePoint, getRandomSpherePoint } from '../utils/math';
import { TreeState, OrnamentData } from '../types';

interface OrnamentsProps {
  state: TreeState;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ state }) => {
  const baublesRef = useRef<THREE.InstancedMesh>(null);
  const giftsRef = useRef<THREE.InstancedMesh>(null);

  // Generate data once
  const { baublesData, giftsData } = useMemo(() => {
    const baubles: OrnamentData[] = [];
    const gifts: OrnamentData[] = [];

    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const isGift = Math.random() > 0.65; // 35% gifts
      
      // Apply power curve to ratio to reduce density at the top (ratio ~ 1)
      const rawRatio = Math.random();
      const ratio = Math.pow(rawRatio, 1.4);
      
      const [tx, ty, tz] = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS * 1.05, ratio);
      const [sx, sy, sz] = getRandomSpherePoint(CONFIG.SCATTER_RADIUS * 1.3);

      const baseScale = isGift 
        ? 0.2 + Math.random() * 0.2 
        : 0.15 + Math.random() * 0.15;

      const data: OrnamentData = {
        id: i,
        treePos: [tx, ty, tz],
        scatterPos: [sx, sy, sz],
        scale: baseScale,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        color: isGift ? COLORS.RED_VELVET.getHexString() : COLORS.GOLD_METALLIC.getHexString(),
        type: isGift ? 'gift' : 'bauble',
        speedFactor: 0.5 + Math.random() * 1.5
      };

      if (isGift) gifts.push(data);
      else baubles.push(data);
    }
    return { baublesData: baubles, giftsData: gifts };
  }, []);

  const tempObj = new THREE.Object3D();
  const tempColor = new THREE.Color();
  const progress = useRef(0);

  useFrame((stateObj, delta) => {
    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    progress.current = THREE.MathUtils.damp(progress.current, target, 1.5, delta);

    const updateMesh = (mesh: THREE.InstancedMesh, data: OrnamentData[]) => {
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            
            const localProgress = THREE.MathUtils.clamp(
                progress.current + (Math.sin(item.id) * 0.1),
                0, 1
            );
            
            const t = localProgress < 0.5 ? 4 * localProgress * localProgress * localProgress : 1 - Math.pow(-2 * localProgress + 2, 3) / 2;

            const x = THREE.MathUtils.lerp(item.scatterPos[0], item.treePos[0], t);
            const y = THREE.MathUtils.lerp(item.scatterPos[1], item.treePos[1], t);
            const z = THREE.MathUtils.lerp(item.scatterPos[2], item.treePos[2], t);

            const floatY = Math.sin(stateObj.clock.getElapsedTime() * item.speedFactor + item.id) * 0.2;
            const rotSpeed = stateObj.clock.getElapsedTime() * 0.5 * (1 - t); 

            tempObj.position.set(x, y + floatY, z);
            tempObj.rotation.set(
                item.rotation[0] + rotSpeed, 
                item.rotation[1] + rotSpeed, 
                item.rotation[2]
            );
            tempObj.scale.setScalar(item.scale * (0.8 + 0.2 * t)); 
            
            tempObj.updateMatrix();
            mesh.setMatrixAt(i, tempObj.matrix);
            
            if (item.type === 'gift') {
                mesh.setColorAt(i, tempColor.set(COLORS.RED_VELVET));
            } else {
                mesh.setColorAt(i, tempColor.set(COLORS.GOLD_METALLIC));
            }
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    if (baublesRef.current) updateMesh(baublesRef.current, baublesData);
    if (giftsRef.current) updateMesh(giftsRef.current, giftsData);
  });

  return (
    <>
      {/* GOLD BAUBLES - HIGH SHINE & GLOW */}
      <instancedMesh ref={baublesRef} args={[undefined, undefined, baublesData.length]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            color={COLORS.GOLD_METALLIC} 
            roughness={0.05} 
            metalness={1.0} 
            emissive={COLORS.GOLD_METALLIC}
            emissiveIntensity={0.8}
        />
      </instancedMesh>

      {/* RED GIFTS - GLOWING RED */}
      <instancedMesh ref={giftsRef} args={[undefined, undefined, giftsData.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color={COLORS.RED_VELVET} 
            roughness={0.4} 
            metalness={0.6}
            emissive={COLORS.RED_VELVET}
            emissiveIntensity={1.5} // Increased brightness for red boxes
        />
      </instancedMesh>
    </>
  );
};