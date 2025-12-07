import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Star } from './Star';
import { TreeState } from '../types';
import { COLORS } from '../constants';

interface SceneProps {
  treeState: TreeState;
}

// Component to handle responsive camera positioning
const ResponsiveCamera = () => {
  const { camera, viewport } = useThree();

  useEffect(() => {
    // Check if we are in portrait mode (width < height)
    const isPortrait = viewport.aspect < 1;
    
    // Zoom in (lower Z) for portrait to fill the screen with the tree
    // Move back (higher Z) for landscape
    const targetZ = isPortrait ? 26 : 32;
    const targetY = -4;

    camera.position.set(0, targetY, targetZ);
    camera.updateProjectionMatrix();
  }, [viewport.aspect, camera]);

  return null;
};

const SceneContent: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <>
      <ResponsiveCamera />
      <PerspectiveCamera makeDefault fov={45} />
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={15}
        maxDistance={50}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.8}
      />

      {/* Cinematic Lighting - UNIFORM BRIGHTNESS ADJUSTMENTS */}
      <ambientLight intensity={1.5} color={COLORS.EMERALD_DEEP} /> 
      
      {/* Top Main Spot */}
      <spotLight 
        position={[10, 50, 10]} 
        angle={0.4} 
        penumbra={0.6} 
        intensity={200} 
        color="#fff5e0" 
        castShadow 
      />
      
      {/* Backlight - Emerald Rim */}
      <pointLight position={[0, 15, -15]} intensity={180} color={COLORS.EMERALD_LIGHT} distance={50} />
      
      {/* Fill Light - Gold Warmth */}
      <pointLight position={[-15, -5, 15]} intensity={160} color={COLORS.GOLD_DARK} distance={40} />
      
      {/* Additional Lower Fill */}
      <pointLight position={[15, -10, 10]} intensity={100} color="#FFD700" distance={30} />

      <Environment preset="city" background={false} />
      
      <Stars radius={100} depth={50} count={6000} factor={6} saturation={0} fade speed={0.5} />
      <fog attach="fog" args={['#000502', 15, 80]} />

      {/* Main Content - Centered vertically around Y=-6 */}
      <group position={[0, -6, 0]}>
        <Foliage state={treeState} />
        <Ornaments state={treeState} />
        <Star state={treeState} />
        
        <ContactShadows 
            opacity={0.8} 
            scale={50} 
            blur={2.5} 
            far={10} 
            resolution={512} 
            color="#000000" 
        />
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.3} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.03} />
      </EffectComposer>
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <div className="w-full h-screen bg-[#000502]">
      <Canvas 
        dpr={[1, 2]} 
        gl={{ antialias: false, toneMapping: 3, toneMappingExposure: 1.1 }} 
        shadows
      >
        <Suspense fallback={null}>
            <SceneContent treeState={treeState} />
        </Suspense>
      </Canvas>
    </div>
  );
};