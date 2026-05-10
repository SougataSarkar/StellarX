import React, { useState, Fragment, useRef } from 'react';
import * as THREE from 'three';
import { Planet } from './Planet';
import { OrbitControls, PerspectiveCamera, Stars, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';

const PLANET_DATA = [
  {
    name: 'Mercury',
    color: '#9ca3af',
    emissive: '#4b5563',
    size: 0.4,
    distance: 8,
    orbitSpeed: 0.04,
    rotationSpeed: 0.01,
    description: 'The smallest and innermost planet in the Solar System.',
    facts: [
      'Orbits the Sun every 88 Earth days',
      'The closest planet to the Sun',
      'Has no atmosphere to retain heat'
    ]
  },
  {
    name: 'Venus',
    color: '#fde68a',
    emissive: '#d97706',
    size: 0.9,
    distance: 12,
    orbitSpeed: 0.015,
    rotationSpeed: 0.005,
    description: 'Often called Earth\'s twin because of their similar size and structure.',
    facts: [
      'The hottest planet in our solar system',
      'Rotates in the opposite direction to most planets',
      'Its atmosphere is thick and toxic'
    ]
  },
  {
    name: 'Earth',
    color: '#60a5fa',
    emissive: '#1d4ed8',
    size: 1,
    distance: 18,
    orbitSpeed: 0.01,
    rotationSpeed: 0.02,
    description: 'Our home planet, the only place we know of so far that\'s inhabited by living things.',
    facts: [
      '71% of Earth\'s surface is covered by water',
      'The only planet not named after a god',
      'The atmosphere protects us from meteoroids'
    ]
  },
  {
    name: 'Mars',
    color: '#f87171',
    emissive: '#991b1b',
    size: 0.6,
    distance: 24,
    orbitSpeed: 0.008,
    rotationSpeed: 0.018,
    description: 'The Red Planet, home to the largest volcano in the solar system.',
    facts: [
      'Has the tallest mountain: Olympus Mons',
      'Iron oxide gives it a reddish appearance',
      'Home to the deepest canyon: Valles Marineris'
    ]
  },
  {
    name: 'Jupiter',
    color: '#fbbf24',
    emissive: '#92400e',
    size: 2.2,
    distance: 34,
    orbitSpeed: 0.004,
    rotationSpeed: 0.04,
    description: 'The largest planet in our solar system, a gas giant with a Great Red Spot.',
    facts: [
      'Twice as massive as all other planets combined',
      'The Great Red Spot is a giant storm',
      'Has at least 95 moons'
    ]
  },
  {
    name: 'Saturn',
    color: '#fef3c7',
    emissive: '#d97706',
    size: 1.8,
    distance: 46,
    orbitSpeed: 0.002,
    rotationSpeed: 0.038,
    hasRings: true,
    description: 'Adorned with a dazzling, complex system of icy rings.',
    facts: [
      'Could float in water because it is mostly gas',
      'Rings are made of ice and rock',
      'The most distant planet visible to the naked eye'
    ]
  },
  {
    name: 'Uranus',
    color: '#a5f3fc',
    emissive: '#0891b2',
    size: 1.2,
    distance: 58,
    orbitSpeed: 0.0015,
    rotationSpeed: 0.03,
    description: 'An ice giant that rotates on its side at an almost 90-degree angle.',
    facts: [
      'The first planet found with a telescope',
      'Has 13 known rings',
      'The coldest planetary atmosphere'
    ]
  },
  {
    name: 'Neptune',
    color: '#3b82f6',
    emissive: '#1e40af',
    size: 1.1,
    distance: 70,
    orbitSpeed: 0.001,
    rotationSpeed: 0.032,
    description: 'The most distant major planet orbiting our Sun, dark, cold and whipped by supersonic winds.',
    facts: [
      'Takes 165 Earth years to orbit the Sun',
      'Has 14 known moons',
      'The windiest planet in our solar system'
    ]
  }
];

function OrbitPath({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.1, 128]} />
      <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

export function PlanetExplorer() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const starsRef = useRef<THREE.Points>(null);

  const activePlanet = PLANET_DATA.find(p => p.name === selectedPlanet);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y -= delta * 0.01;
      starsRef.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <>
      <color attach="background" args={['#010207']} />
      
      <PerspectiveCamera makeDefault position={[0, 40, 80]} fov={50} />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        makeDefault
        minDistance={15}
        maxDistance={200}
        autoRotate={!selectedPlanet}
        autoRotateSpeed={0.3}
      />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={15} color="#fff1cc" />
      
      {/* Background Ambience */}
      <Stars ref={starsRef} radius={150} depth={50} count={10000} factor={7} saturation={1} fade speed={1} />
      <Sparkles count={500} scale={100} size={2} speed={0.4} opacity={0.4} color="#c7d2fe" />
      
      {/* The Sun - Central Core with Glow */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[4, 64, 64]} />
          <meshStandardMaterial 
            emissive="#fbbf24" 
            emissiveIntensity={4} 
            color="#f59e0b"
            roughness={0}
          />
          {/* Sun Corona */}
          <mesh scale={1.15}>
            <sphereGeometry args={[4, 32, 32]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              transparent 
              opacity={0.15} 
              side={THREE.BackSide}
            />
          </mesh>
        </mesh>
      </Float>
      
      {PLANET_DATA.map((planet) => (
        <Fragment key={planet.name}>
          <OrbitPath radius={planet.distance} />
          <Planet
            {...planet}
            isSelected={selectedPlanet === planet.name}
            onSelect={() => setSelectedPlanet(selectedPlanet === planet.name ? null : planet.name)}
          />
        </Fragment>
      ))}

      {/* Focus light for selected planet */}
      {activePlanet && (
        <group position={[0, 0, 0]}>
          <pointLight intensity={3} color={activePlanet.color} distance={30} />
        </group>
      )}

      {/* Premium Post-Processing */}
      <EffectComposer multisampling={4}>
        <Bloom 
          luminanceThreshold={0.4} 
          luminanceSmoothing={0.9} 
          intensity={1.5} 
          mipmapBlur
        />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={1.2} />
      </EffectComposer>
    </>
  );
}
