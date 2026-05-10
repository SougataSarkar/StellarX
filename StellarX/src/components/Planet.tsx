import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Float, Html, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface PlanetProps {
  name: string;
  color: string;
  emissive: string;
  size: number;
  distance: number;
  orbitSpeed: number;
  rotationSpeed: number;
  hasRings?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  description: string;
  facts: string[];
}

export function Planet({ 
  name, 
  color, 
  emissive, 
  size, 
  distance, 
  orbitSpeed, 
  rotationSpeed, 
  hasRings, 
  isSelected, 
  onSelect, 
  description, 
  facts 
}: PlanetProps) {
  const planetRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Generate a random secondary color based on primary
  const secondaryColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.7);
    return c.getStyle();
  }, [color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Orbital movement
    if (planetRef.current) {
      planetRef.current.position.x = Math.cos(t * orbitSpeed) * distance;
      planetRef.current.position.z = Math.sin(t * orbitSpeed) * distance;
    }

    // Axial rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += rotationSpeed * 1.5;
      cloudRef.current.rotation.z += rotationSpeed * 0.5;
    }
  });

  return (
    <group ref={planetRef}>
      <Float speed={isSelected ? 0 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group 
          onClick={(e) => { e.stopPropagation(); onSelect(); }} 
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Base Surface with Terrain Detail */}
          <Sphere ref={meshRef} args={[size, 64, 64]}>
            <MeshDistortMaterial
              color={color}
              emissive={secondaryColor}
              emissiveIntensity={isSelected || hovered ? 1 : 0.5}
              roughness={0.8}
              metalness={0.2}
              distort={0.15}
              speed={2}
            />
          </Sphere>

          {/* Tiny Detailed Structure Layer (Clouds/Storms/Terrain variations) */}
          <Sphere ref={cloudRef} args={[size * 1.02, 64, 64]}>
            <MeshDistortMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={0.8}
              transparent
              opacity={0.3}
              distort={0.4}
              speed={4}
              roughness={1}
            />
          </Sphere>

          {/* Planet Atmosphere Glow */}
          <Sphere args={[size * 1.1, 32, 32]}>
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.08}
              side={THREE.BackSide}
            />
          </Sphere>

          {/* Saturn's Rings with Detailed Texture Simulation */}
          {hasRings && (
            <group rotation={[Math.PI / 2.5, 0, 0]}>
              <mesh>
                <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
                <meshStandardMaterial 
                  color={color} 
                  transparent 
                  opacity={0.4} 
                  side={THREE.DoubleSide} 
                  emissive={emissive}
                  emissiveIntensity={0.5}
                />
              </mesh>
              {/* Outer Ring Gap simulation */}
              <mesh>
                <ringGeometry args={[size * 2.25, size * 2.4, 64]} />
                <meshStandardMaterial 
                  color={color} 
                  transparent 
                  opacity={0.2} 
                  side={THREE.DoubleSide} 
                />
              </mesh>
            </group>
          )}

          {/* Planet Label (Only when not selected) */}
          {!isSelected && (
            <Html position={[0, size + 1.2, 0]} center>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: hovered ? 1 : 0.6, y: 0 }}
                className="pointer-events-none"
              >
                <div className="px-5 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white text-[10px] font-bold tracking-[0.4em] uppercase whitespace-nowrap shadow-2xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {name}
                </div>
              </motion.div>
            </Html>
          )}

          {/* Detailed Info (Only when selected) */}
          {isSelected && (
            <Html position={[size + 2.5, 0, 0]} center>
              <motion.div 
                initial={{ opacity: 0, x: -40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="w-80 md:w-[28rem] bg-slate-950/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 rounded-full opacity-30 blur-3xl`} style={{ backgroundColor: color }} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-[1px] bg-indigo-500" />
                    <span className="text-[10px] font-black tracking-[0.5em] text-indigo-400 uppercase">Sector Analysis</span>
                  </div>
                  
                  <h2 className="text-5xl font-bold text-white mb-6 tracking-tighter">{name}</h2>
                  
                  <p className="text-slate-300 text-base mb-8 leading-relaxed font-medium opacity-90">
                    {description}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    {facts.map((fact, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: color }} />
                        <p className="text-slate-400 text-xs font-semibold leading-normal">{fact}</p>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect();
                    }}
                    className="w-full py-4 bg-white text-slate-950 hover:bg-indigo-50 rounded-2xl text-sm font-black transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] tracking-widest uppercase"
                  >
                    Return to Navigation
                  </button>
                </div>
              </motion.div>
            </Html>
          )}
        </group>
      </Float>
    </group>
  );
}
