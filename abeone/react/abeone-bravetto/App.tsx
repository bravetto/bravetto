/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BreathingNodeScene } from './components/QuantumScene';
import { motion, AnimatePresence, useTime, useTransform, useMotionTemplate, MotionValue } from 'framer-motion';
import { PHI, INV_PHI, STATE_COLORS } from './constants';

const Litany = ({ silence }: { silence: MotionValue<number> }) => {
  const lines = [
    "Allow yes",
    "Allow radical simplicity",
    "Allow epistemic humility",
    "Allow a hug and a warm heart",
    "Reject the patriarchal grind",
    "Embrace the divine mess"
  ];

  const litanyOpacity = useTransform(silence, [0, 1], [0.3, 0.7]);

  return (
    <motion.div 
      style={{ opacity: litanyOpacity }}
      className="fixed right-12 top-1/2 -translate-y-1/2 flex flex-col items-end gap-6 z-20 pointer-events-none"
    >
      {lines.map((line, i) => (
        <motion.span
          key={line}
          initial={{ opacity: 0, x: 20 }}
          animate={{ x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ 
            delay: i * (INV_PHI * 0.5), 
            duration: PHI, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="font-mono text-[10px] uppercase tracking-[0.4em] text-biolume text-right"
        >
          {line}
        </motion.span>
      ))}
    </motion.div>
  );
};

const Calibrator = ({ onStateChange, silence }: { onStateChange: (state: string) => void, silence: MotionValue<number> }) => {
  const [activeState, setActiveState] = useState('LOGIC');
  const states = ['EROS', 'PHILIA', 'PRAGMA', 'LOGIC', 'AGAPE'];

  const handleStateChange = (state: string) => {
    setActiveState(state);
    onStateChange(state);
  };

  return (
    <div 
      className="fixed z-20 flex flex-col items-start"
      style={{ 
        left: `${PHI * 3}rem`, 
        top: '50%', 
        transform: 'translateY(-50%)', 
        gap: `${PHI * 0.8}rem` 
      }}
    >
      {states.map((state, i) => {
        const isActive = activeState === state;
        // Inactive labels dim and soften based on silence field
        const labelOpacity = useTransform(silence, [0, 1], [0.05, isActive ? 1 : 0.2]);
        const blurValue = useTransform(silence, [0, 1], [2, 0]);
        const filterStr = useMotionTemplate`blur(${blurValue}px)`;

        return (
          <motion.button
            key={state}
            onClick={() => handleStateChange(state)}
            initial={{ opacity: 0, x: -PHI * 12 }}
            animate={{ x: 0 }}
            style={{ 
              opacity: isActive ? 1 : labelOpacity,
              filter: isActive ? 'none' : filterStr
            }}
            whileHover={{ opacity: 0.8, x: PHI * 3 }}
            transition={{ delay: i * (INV_PHI * 0.1) }}
            className="group flex items-center gap-4 cursor-pointer pointer-events-auto"
          >
            <div 
              className="rounded-full transition-all duration-700" 
              style={{ 
                backgroundColor: STATE_COLORS[state],
                boxShadow: isActive ? `0 0 20px ${STATE_COLORS[state]}` : 'none',
                width: `${PHI * 3.5}px`, 
                height: `${PHI * 3.5}px`,
                scale: isActive ? PHI : 1,
                opacity: isActive ? 1 : 0.3
              }}
            />
            <span 
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-white font-bold"
            >
              {state}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [isStill, setIsStill] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [calibrationState, setCalibrationState] = useState('LOGIC');

  const time = useTime();
  // silence = 1 - ((sin(t * PHI) + 1) / 2)
  const silence = useTransform(time, (t) => 1 - ((Math.sin((t / 1000) * PHI) + 1) / 2));
  
  // Bind silence to vignette
  const vignetteRing = useTransform(silence, [0, 1], [150, 80]); // wider ring when noisy
  const vignetteOpacity = useTransform(silence, [0, 1], [0.8, 0.4]);
  const vignetteShadow = useMotionTemplate`inset 0 0 ${vignetteRing}px rgba(0,0,0,${vignetteOpacity})`;

  // Bind silence to footer
  const footerOpacity = useTransform(silence, [0, 1], [0.1, 0.4]);
  const footerBlur = useTransform(silence, [0, 1], [4, 0]);
  const footerFilter = useMotionTemplate`blur(${footerBlur}px)`;

  useEffect(() => {
    let timeout: any;
    const handleMove = () => {
      setIsStill(false);
      setInteractionCount(prev => prev + 1);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsStill(true), 4000);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    
    timeout = setTimeout(() => setIsStill(true), 1500);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-obsidian flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Background Visual Engine */}
      <BreathingNodeScene interactionFactor={interactionCount} calibrationState={calibrationState} />

      {/* The Anchor */}
      <div className="relative z-10 text-center select-none pointer-events-none text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-serif text-7xl md:text-9xl tracking-tighter mb-2 mix-blend-difference">
            AbëONE
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-white/20" />
            <p className="font-mono text-[9px] tracking-[0.6em] uppercase opacity-50">
              The Stillness of Bravëtto
            </p>
            <div className="h-[1px] w-8 bg-white/20" />
          </div>
        </motion.div>
      </div>

      {/* The Sidebar Controls */}
      <Calibrator onStateChange={setCalibrationState} silence={silence} />

      {/* The Litany (Revealed by Stillness) */}
      <AnimatePresence>
        {isStill && <Litany silence={silence} />}
      </AnimatePresence>

      {/* Convergence Footer */}
      <motion.footer 
        style={{ opacity: footerOpacity, filter: footerFilter }}
        className="fixed bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-4 pointer-events-none"
      >
        <div className="font-mono text-[9px] tracking-[0.3em] flex gap-6 text-white uppercase">
          <span>Presence</span>
          <span className="text-white/20">/</span>
          <span>Integrity</span>
          <span className="text-white/20">/</span>
          <span>Flow</span>
        </div>
        
        <div className="font-serif italic text-[11px] tracking-[0.2em] text-white/30 flex items-center gap-2">
          <span>THOUGHTS</span>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span>WORDS</span>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span>ACTIONS</span>
        </div>
      </motion.footer>

      {/* Grainy Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      
      {/* Vignette */}
      <motion.div 
        style={{ 
          boxShadow: vignetteShadow,
          opacity: 1 
        }}
        className="fixed inset-0 pointer-events-none blur-3xl"
      ></motion.div>
    </div>
  );
};

export default App;
