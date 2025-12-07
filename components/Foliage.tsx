import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { getTreePoint, getRandomSpherePoint } from '../utils/math';
import { TreeState } from '../types';

interface FoliageProps {
  state: TreeState;
}

// Custom Shader Material for performance and glow effect
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMix: { value: 0 }, // 0 = scatter, 1 = tree
    uColorNear: { value: new THREE.Color(COLORS.EMERALD_DEEP) },
    uColorFar: { value: new THREE.Color(COLORS.EMERALD_LIGHT) },
    uGold: { value: new THREE.Color(COLORS.GOLD_METALLIC) },
    uWarmWhite: { value: new THREE.Color(COLORS.WHITE_WARM) }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uMix;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;
    varying float vLife;

    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float easeMix = easeInOutCubic(uMix);
      
      vec3 pos = mix(aScatterPos, aTreePos, easeMix);
      
      // Breathing effect
      float breath = sin(uTime * 1.5 + aRandom * 10.0) * 0.15;
      pos += normalize(pos) * breath * easeMix;
      
      // Floating effect
      pos.y += sin(uTime * 0.5 + aRandom * 5.0) * 0.5 * (1.0 - easeMix);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Size attenuation
      // Increased size factor (130.0) for larger, more visible particles
      gl_PointSize = (130.0 * (0.6 + aRandom * 0.6)) / -mvPosition.z;
      
      vAlpha = 0.6 + 0.4 * sin(uTime + aRandom * 10.0);
      vLife = aRandom; // Pass random seed to fragment
    }
  `,
  fragmentShader: `
    uniform vec3 uColorNear;
    uniform vec3 uColorFar;
    uniform vec3 uGold;
    uniform vec3 uWarmWhite;
    
    varying float vAlpha;
    varying float vLife;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float r = length(xy);
      if (r > 0.5) discard;

      // Soft glow center
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.2);

      // Gradient Green Base - Boosted brightness (1.2 multiplier)
      vec3 baseColor = mix(uColorNear, uColorFar, glow * 2.5) * 1.2;

      // Gold Sparkles - Increased frequency (vLife > 0.85)
      if (vLife > 0.85) { 
        // Twinkle effect
        float twinkle = 0.5 + 0.5 * sin(vAlpha * 10.0);
        baseColor = mix(baseColor, uGold, twinkle * 0.9);
      } 
      // Edge Highlights (Warm White/Gold rim)
      else if (glow < 0.35) {
         // Stronger rim light
         baseColor = mix(baseColor, uWarmWhite, 0.6);
      }

      gl_FragColor = vec4(baseColor, glow);
    }
  `
};

export const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const count = CONFIG.FOLIAGE_COUNT;

  const [positions, treePos, scatterPos, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const tPos = new Float32Array(count * 3);
    const sPos = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const ratio = Math.random();
      // Increase exponent to 1.8 to push density significantly towards the bottom
      // This thins out the top of the tree (ratio -> 1)
      const biasedRatio = Math.pow(ratio, 1.8);
      
      const [tx, ty, tz] = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS, biasedRatio);
      const [sx, sy, sz] = getRandomSpherePoint(CONFIG.SCATTER_RADIUS);

      tPos[i * 3] = tx;
      tPos[i * 3 + 1] = ty;
      tPos[i * 3 + 2] = tz;

      sPos[i * 3] = sx;
      sPos[i * 3 + 1] = sy;
      sPos[i * 3 + 2] = sz;
      
      rands[i] = Math.random();
    }
    return [pos, tPos, sPos, rands];
  }, [count]);

  useFrame((stateObj, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = stateObj.clock.getElapsedTime();
      
      const targetMix = state === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      materialRef.current.uniforms.uMix.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMix.value,
        targetMix,
        delta * 1.2
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePos.length / 3}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPos.length / 3}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};