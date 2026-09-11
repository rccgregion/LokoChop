import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  icon: string;
}

// Global dispatcher function for triggering fly-to-cart
export const triggerFlyToCart = (e?: React.MouseEvent | HTMLElement, customIcon?: string) => {
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if (e && 'clientX' in e) {
    startX = e.clientX;
    startY = e.clientY;
  } else if (e && 'getBoundingClientRect' in e) {
    const rect = (e as HTMLElement).getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  }

  // Find cart target icon
  const desktopTarget = document.getElementById('global-cart-icon-target');
  const mobileTarget = document.getElementById('mobile-cart-icon-target');
  const targetElem = (window.innerWidth < 768 ? mobileTarget : desktopTarget) || desktopTarget || mobileTarget;

  let targetX = window.innerWidth - 60;
  let targetY = 30;

  if (targetElem) {
    const rect = targetElem.getBoundingClientRect();
    targetX = rect.left + rect.width / 2;
    targetY = rect.top + rect.height / 2;
  }

  const icons = ['🍲', '🍗', '🍛', '🥟', '🥩', '🌶️'];
  const chosenIcon = customIcon || icons[Math.floor(Math.random() * icons.length)];

  window.dispatchEvent(
    new CustomEvent('lokochop-fly-particle', {
      detail: { startX, startY, targetX, targetY, icon: chosenIcon },
    })
  );
};

export const FlyToCartRenderer: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleAddParticle = (ev: Event) => {
      const customEv = ev as CustomEvent<Omit<Particle, 'id'>>;
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        ...customEv.detail,
      };

      setParticles((prev) => [...prev, newParticle]);

      // Trigger bounce haptic on target after flight duration
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lokochop-cart-bounce'));
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 700);
    };

    window.addEventListener('lokochop-fly-particle', handleAddParticle);
    return () => window.removeEventListener('lokochop-fly-particle', handleAddParticle);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => {
          const midX = (p.startX + p.targetX) / 2 + (p.startX > p.targetX ? 40 : -40);
          const midY = Math.min(p.startY, p.targetY) - 80;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: p.startX,
                y: p.startY,
                scale: 1.2,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: [p.startX, midX, p.targetX],
                y: [p.startY, midY, p.targetY],
                scale: [1.2, 1.4, 0.4],
                opacity: [1, 1, 0.8],
                rotate: [0, 180, 360],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 0.68,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-md select-none"
            >
              {p.icon}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
