import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Spacecraft() {
  const groupRef = useRef<THREE.Group>(null);
  const shipRef = useRef<THREE.Group>(null);
  const solidGroupRef = useRef<THREE.Group>(null);
  const wireframeGroupRef = useRef<THREE.Group>(null);
  
  // Custom materials setup
  const hullMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.8, roughness: 0.2, transparent: true }), []);
  const darkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0f172a", metalness: 0.9, roughness: 0.4, transparent: true }), []);
  const glassMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#38bdf8", metalness: 1, roughness: 0, emissive: "#0284c7", emissiveIntensity: 0.8, transparent: true, opacity: 0.8 }), []);
  const engineMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fb923c", emissive: "#f97316", emissiveIntensity: 4, transparent: true }), []);

  const blueprintMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0ea5e9", emissive: "#0ea5e9", emissiveIntensity: 0.8, wireframe: true, transparent: true, opacity: 0, depthWrite: false }), []);

  useFrame((state, delta) => {
    // Calculate scroll progress 0 to 1
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    let progress = scrollMax > 0 ? scrollY / scrollMax : 0;
    
    // Clamp progress
    progress = Math.max(0, Math.min(1, progress));

    if (groupRef.current && shipRef.current) {
      // Base bobbing animation naturally floating
      const t = state.clock.getElapsedTime();
      shipRef.current.position.y = Math.sin(t * 2) * 0.15;
      
      // Cinematic path calculation
      // Keep it completely centered initially, rotate 360 deg (Math.PI * 2)
      const targetX = 0;
      const targetY = -0.5; // Slightly lower than center
      const targetZ = THREE.MathUtils.lerp(0, 3, progress); // Move slightly closer to camera
      
      const targetRotX = 0.5;
      // 360 degree rotation throughout the scroll
      const targetRotY = progress * Math.PI * 2;
      const targetRotZ = Math.sin(t * 1) * 0.05;

      // Super smooth damping
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 2.5, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 2.5, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 2.5, delta);
      
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 2.5, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 3, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetRotZ, 2.5, delta);

      // Transition materials (Solid fades out, wireframe fades in)
      const solidOpacity = 1 - THREE.MathUtils.clamp((progress - 0.2) / 0.5, 0, 1);
      const wireOpacity = THREE.MathUtils.clamp((progress - 0.2) / 0.5, 0, 1);

      hullMaterial.opacity = solidOpacity;
      darkMaterial.opacity = solidOpacity;
      glassMaterial.opacity = solidOpacity * 0.8;
      engineMaterial.opacity = solidOpacity;
      
      blueprintMaterial.opacity = wireOpacity;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Ship faces toward +Z locally */}
      <group ref={shipRef}>
        
        {/* SOLID VERSION */}
        <group ref={solidGroupRef}>
          {/* Main Fuselage */}
          <mesh position={[0, 0, 1]} rotation={[-Math.PI / 2, 0, 0]} material={hullMaterial}>
            <cylinderGeometry args={[0.5, 1, 6, 24]} />
          </mesh>

          {/* Cockpit */}
          <mesh position={[0, 0.8, 1.5]} rotation={[-Math.PI / 2 + 0.1, 0, 0]} material={glassMaterial}>
            <capsuleGeometry args={[0.4, 1.5, 4, 16]} />
          </mesh>

          {/* Wings */}
          <mesh position={[2.5, 0, -1]} rotation={[0, 0, Math.PI / 12]} material={darkMaterial}>
            <boxGeometry args={[5, 0.25, 2.5]} />
          </mesh>
          <mesh position={[-2.5, 0, -1]} rotation={[0, 0, -Math.PI / 12]} material={darkMaterial}>
            <boxGeometry args={[5, 0.25, 2.5]} />
          </mesh>

          {/* Wing tips */}
          <mesh position={[4.8, 0.5, -1]} rotation={[0, 0, Math.PI / 2]} material={hullMaterial}>
            <boxGeometry args={[2.5, 0.2, 2.5]} />
          </mesh>
          <mesh position={[-4.8, 0.5, -1]} rotation={[0, 0, Math.PI / 2]} material={hullMaterial}>
            <boxGeometry args={[2.5, 0.2, 2.5]} />
          </mesh>

          {/* Thrusters */}
          <mesh position={[1.2, 0, -2]} rotation={[Math.PI / 2, 0, 0]} material={darkMaterial}>
            <cylinderGeometry args={[0.5, 0.7, 1.2, 16]} />
          </mesh>
          <mesh position={[-1.2, 0, -2]} rotation={[Math.PI / 2, 0, 0]} material={darkMaterial}>
            <cylinderGeometry args={[0.5, 0.7, 1.2, 16]} />
          </mesh>

          {/* Engine Glows */}
          <mesh position={[1.2, 0, -2.6]} rotation={[Math.PI / 2, 0, 0]} material={engineMaterial}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
          </mesh>
          <mesh position={[-1.2, 0, -2.6]} rotation={[Math.PI / 2, 0, 0]} material={engineMaterial}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
          </mesh>

          {/* Thruster Lights for Bloom */}
          <pointLight position={[1.2, 0, -3]} color="#f97316" intensity={3} distance={10} decay={2} />
          <pointLight position={[-1.2, 0, -3]} color="#f97316" intensity={3} distance={10} decay={2} />
        </group>

        {/* BLUEPRINT VERSION */}
        <group ref={wireframeGroupRef}>
          {/* Main Fuselage */}
          <mesh position={[0, 0, 1]} rotation={[-Math.PI / 2, 0, 0]} material={blueprintMaterial}>
            <cylinderGeometry args={[0.5, 1, 6, 24]} />
          </mesh>

          {/* Cockpit */}
          <mesh position={[0, 0.8, 1.5]} rotation={[-Math.PI / 2 + 0.1, 0, 0]} material={blueprintMaterial}>
            <capsuleGeometry args={[0.4, 1.5, 4, 16]} />
          </mesh>

          {/* Wings */}
          <mesh position={[2.5, 0, -1]} rotation={[0, 0, Math.PI / 12]} material={blueprintMaterial}>
            <boxGeometry args={[5, 0.25, 2.5]} />
          </mesh>
          <mesh position={[-2.5, 0, -1]} rotation={[0, 0, -Math.PI / 12]} material={blueprintMaterial}>
            <boxGeometry args={[5, 0.25, 2.5]} />
          </mesh>

          {/* Wing tips */}
          <mesh position={[4.8, 0.5, -1]} rotation={[0, 0, Math.PI / 2]} material={blueprintMaterial}>
            <boxGeometry args={[2.5, 0.2, 2.5]} />
          </mesh>
          <mesh position={[-4.8, 0.5, -1]} rotation={[0, 0, Math.PI / 2]} material={blueprintMaterial}>
            <boxGeometry args={[2.5, 0.2, 2.5]} />
          </mesh>

          {/* Thrusters */}
          <mesh position={[1.2, 0, -2]} rotation={[Math.PI / 2, 0, 0]} material={blueprintMaterial}>
            <cylinderGeometry args={[0.5, 0.7, 1.2, 16]} />
          </mesh>
          <mesh position={[-1.2, 0, -2]} rotation={[Math.PI / 2, 0, 0]} material={blueprintMaterial}>
            <cylinderGeometry args={[0.5, 0.7, 1.2, 16]} />
          </mesh>
        </group>

      </group>
    </group>
  );
}

