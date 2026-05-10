import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Float, Sparkles, OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Spacecraft } from './Spacecraft';

export function SpaceScene() {
  const starsRef = useRef<THREE.Points>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y -= delta * 0.02;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <>
      <color attach="background" args={['#010207']} />
      <fog attach="fog" args={['#010207', 8, 30]} />
      
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 10, 5]} intensity={3} color="#ffffff" />
      <pointLight position={[-10, 0, -5]} intensity={5} color="#4f46e5" distance={50} decay={2} />
      <pointLight position={[10, -5, 5]} intensity={3} color="#db2777" distance={50} decay={2} />
      
      <Stars ref={starsRef} radius={100} depth={50} count={7000} factor={6} saturation={1} fade speed={1.5} />
      
      <Sparkles count={400} scale={20} size={1.5} speed={0.5} opacity={0.6} color="#c7d2fe" />
      
      <Spacecraft />

      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <Sphere ref={planetRef} args={[2.5, 64, 64]} position={[0, -0.5, -6]}>
          <MeshDistortMaterial
            color="#0f172a"
            emissive="#1e1b4b"
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.9}
            distort={0.3}
            speed={2}
          />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={3} floatIntensity={2}>
        <mesh position={[4, 2, -10]}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial 
            color="#ec4899" 
            emissive="#be185d"
            emissiveIntensity={1.5}
            roughness={0.1}
            metalness={0.8}
            wireframe={true}
          />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={4} floatIntensity={1.5}>
        <mesh position={[-5, -1, -8]}>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial 
            color="#4f46e5" 
            emissive="#3730a3"
            emissiveIntensity={2}
            roughness={0.3}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>
      </Float>

      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.3} 
        maxPolarAngle={Math.PI / 1.8} 
        minPolarAngle={Math.PI / 2.5}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={2} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
}
