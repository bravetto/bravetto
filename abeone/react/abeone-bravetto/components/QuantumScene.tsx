/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Environment, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { PHI, GOLDEN_ANGLE, STATE_COLORS } from '../constants';

const CoherenceHalo = ({ interactionFactor, color, baseScale, freq }: { interactionFactor: number, color: string, baseScale: number, freq: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Scale pulses at the given frequency
      const pulse = Math.sin(t * freq) * 0.15 + baseScale + (Math.max(0, interactionFactor) * 0.001);
      meshRef.current.scale.set(pulse, pulse, pulse);
      // Opacity tied to sin(t * PHI * freq) for a shimmering interference effect
      if (meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.opacity = (Math.sin(t * PHI * freq) * 0.2 + 0.25);
      }
    }
  });

  return (
    <Torus ref={meshRef} args={[1, 0.0015, 16, 128]} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
    </Torus>
  );
};

const PulseNode = ({ interactionFactor, calibrationState }: { interactionFactor: number, calibrationState: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = STATE_COLORS[calibrationState] || STATE_COLORS.LOGIC;
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // PHI pulse: scale oscillates between 1/phi and phi rhythmically
      // User formula: sin(t/phi) * 0.5 + 1.118 (approx range [0.618, 1.618])
      const pulse_scale = Math.sin(t / PHI) * 0.5 + 1.118;
      // Interaction factor should augment the pulse, not determine the base scale
      const scale = pulse_scale * (1 + interactionFactor * 0.0001);
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y = t * (1/PHI) * 0.2;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 128, 128]}>
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          distort={calibrationState === 'AGAPE' ? 0.4 : 0.2}
          speed={PHI}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      {/* Inner Coherence Ring: Pulses at 1.0 frequency (Sphere is 1/PHI) */}
      <CoherenceHalo interactionFactor={interactionFactor} color={color} baseScale={1.8} freq={1} />
      {/* Outer Coherence Field: Pulses at PHI frequency (Harmonic beat) */}
      <CoherenceHalo interactionFactor={interactionFactor} color={color} baseScale={1.8 * PHI} freq={PHI} />
    </group>
  );
};

const FibonacciSpiral = ({ interactionFactor }: { interactionFactor: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  
  const count = 377; // Fibonacci number
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const goldenAngleRad = GOLDEN_ANGLE * (Math.PI / 180);
    
    for (let i = 0; i < count; i++) {
      const angle = i * goldenAngleRad;
      const radius = Math.sqrt(i) * 0.25 * PHI;
      
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      
      const targetX = (mouse.x * viewport.width) / 2;
      const targetY = (mouse.y * viewport.height) / 2;
      
      const dx = targetX - x;
      const dy = targetY - y;
      
      const speed = 0.005 + (Math.min(1000, interactionFactor) * 0.00001);
      posAttr.setXYZ(
        i, 
        x + dx * speed, 
        y + dy * speed, 
        z + Math.sin(t / PHI + i) * 0.005
      );
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.z = t * 0.02 * PHI;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#FFFFFF"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const BreathingNodeScene: React.FC<{ interactionFactor: number, calibrationState: string }> = ({ interactionFactor, calibrationState }) => {
  return (
    <div className="absolute inset-0 z-0 bg-[#050506]">
      <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
        <color attach="background" args={['#0A0A0B']} />
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#FFFFFF" />
        
        <Float speed={PHI} rotationIntensity={0.5} floatIntensity={1}>
          <PulseNode interactionFactor={interactionFactor} calibrationState={calibrationState} />
        </Float>
        
        <FibonacciSpiral interactionFactor={interactionFactor} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
