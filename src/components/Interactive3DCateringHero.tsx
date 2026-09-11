import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { MessageCircle, Sparkles, ChefHat, Flame } from 'lucide-react';

interface Interactive3DCateringHeroProps {
  whatsAppUrl: string;
}

export const Interactive3DCateringHero: React.FC<Interactive3DCateringHeroProps> = ({
  whatsAppUrl,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt mechanics with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  // Parallax ingredient transforms
  const chiliX = useTransform(mouseX, [-0.5, 0.5], [-25, 25]);
  const chiliY = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);

  const catfishX = useTransform(mouseX, [-0.5, 0.5], [30, -30]);
  const catfishY = useTransform(mouseY, [-0.5, 0.5], [20, -20]);

  const pepperX = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
  const pepperY = useTransform(mouseY, [-0.5, 0.5], [18, -18]);

  const stewPotX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const stewPotY = useTransform(mouseY, [-0.5, 0.5], [-15, 15]);

  const plantainX = useTransform(mouseX, [-0.5, 0.5], [-18, 18]);
  const plantainY = useTransform(mouseY, [-0.5, 0.5], [15, -15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      id="event-catering-hero"
      aria-label="Event & Crowd Feeding in Lokoja"
      className="w-full max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 pt-2"
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-surface-container-low/80 to-primary/15 p-5 sm:p-7 md:p-8 shadow-xl shadow-orange-500/10 backdrop-blur-xl transition-shadow duration-300"
      >
        {/* Ambient 3D Depth Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-amber-500/10 pointer-events-none"
          style={{ transform: 'translateZ(-20px)' }}
        />

        {/* ------------------------------------------------------------------- */}
        {/* PARALLAX 3D FLOATING FOOD INGREDIENTS (Continuous Float + Mouse Tilt) */}
        {/* ------------------------------------------------------------------- */}
        
        {/* 1. Flying Fiery Chili 🌶️ (Top Right) */}
        <motion.div
          style={{ x: chiliX, y: chiliY, transform: 'translateZ(65px)' }}
          className="absolute top-4 right-20 sm:right-32 pointer-events-none select-none z-20 animate-ingredient-1 hidden sm:block"
        >
          <div className="relative group">
            <span className="text-3xl sm:text-4xl filter drop-shadow-lg">🌶️</span>
            <span className="absolute -bottom-2 -left-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-600/90 text-white shadow-xs backdrop-blur-xs">
              Rodo
            </span>
          </div>
        </motion.div>

        {/* 2. Steaming Confluence Catfish 🐟 (Bottom Right) */}
        <motion.div
          style={{ x: catfishX, y: catfishY, transform: 'translateZ(85px)' }}
          className="absolute -bottom-2 right-4 sm:right-12 pointer-events-none select-none z-20 animate-ingredient-2 hidden sm:block"
        >
          <div className="relative">
            <span className="text-4xl sm:text-5xl filter drop-shadow-xl">🐟</span>
            <span className="absolute -top-1 -right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-teal-700/90 text-white shadow-xs backdrop-blur-xs">
              Fresh Catfish
            </span>
          </div>
        </motion.div>

        {/* 3. Sweet Bell Pepper 🫑 (Top Left) */}
        <motion.div
          style={{ x: pepperX, y: pepperY, transform: 'translateZ(50px)' }}
          className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none select-none z-20 animate-ingredient-3 hidden md:block"
        >
          <span className="text-2xl sm:text-3xl filter drop-shadow-md opacity-85">🫑</span>
        </motion.div>

        {/* 4. Steaming Stew Pot 🍲 (Right Middle) */}
        <motion.div
          style={{ x: stewPotX, y: stewPotY, transform: 'translateZ(75px)' }}
          className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-28 pointer-events-none select-none z-15 animate-ingredient-1 hidden lg:block opacity-90"
        >
          <div className="relative">
            <span className="text-4xl sm:text-5xl filter drop-shadow-2xl">🍲</span>
            <span className="absolute -top-2 left-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-600/90 text-white shadow-xs backdrop-blur-xs">
              Party Jollof
            </span>
          </div>
        </motion.div>

        {/* 5. Golden Dodo Plantain 🍌 (Bottom Middle) */}
        <motion.div
          style={{ x: plantainX, y: plantainY, transform: 'translateZ(55px)' }}
          className="absolute bottom-3 right-60 pointer-events-none select-none z-15 animate-ingredient-2 hidden xl:block"
        >
          <span className="text-3xl filter drop-shadow-md">🍌</span>
        </motion.div>

        {/* ------------------------------------------------------------------- */}
        {/* HERO CONTENT LAYER                                                  */}
        {/* ------------------------------------------------------------------- */}
        <div 
          className="relative z-10 space-y-4 w-full"
          style={{ transform: 'translateZ(30px)' }}
        >
          
          {/* Catering Service Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide backdrop-blur-md shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
            <span className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-primary" />
              Lokoja Event Catering &amp; Bulk Orders Hotline
            </span>
          </div>

          {/* Headline & Narrative */}
          <div className="space-y-2">
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black text-on-surface tracking-tight leading-tight flex flex-wrap items-center gap-2">
              <span>🎉 Hosting an Event or Feeding a Crowd in Lokoja?</span>
              <span className="inline-flex items-center text-primary">🍲</span>
            </h1>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed w-full">
              From weddings and corporate workshops to church conferences and big family hangouts, LokoChop connects you directly with Lokoja&apos;s most reliable caterers and bukka kitchens. Get tailored bulk menus, hygienic food packs, and steaming party trays delivered hot, fresh, and strictly on schedule.
            </p>
          </div>

          {/* Core Highlights & High-Converting WhatsApp CTA on the SAME LINE */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
            <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-outline-variant/30 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-on-surface shadow-2xs whitespace-nowrap">
              <span>⏱️</span>
              <span>Punctual delivery, metro-wide</span>
            </span>
            <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-outline-variant/30 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-on-surface shadow-2xs whitespace-nowrap">
              <span>🍗</span>
              <span>Verified, premium vendors</span>
            </span>
            <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-outline-variant/30 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-on-surface shadow-2xs whitespace-nowrap">
              <span>💰</span>
              <span>Bulk discount rates</span>
            </span>

            {/* High-Converting WhatsApp CTA with Glowing Border, Pulse & Liquid Ripple */}
            <motion.a
              id="catering-whatsapp-hero-btn"
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              animate={{
                scale: [1, 1.025, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.96 }}
              className="relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#25D366] via-[#20ba5a] to-[#128C7E] text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all cursor-pointer whitespace-nowrap overflow-hidden animate-whatsapp-glow group"
              title="Chat on WhatsApp for event catering or bulk orders"
            >
              {/* Liquid Shimmer Sweep */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white shrink-0" />
              <span>Chat on WhatsApp (+2349074072454)</span>
            </motion.a>
          </div>

        </div>

        {/* Ambient Decorative Glow Sphere */}
        <div 
          className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-amber-500/10 pointer-events-none blur-2xl -z-0"
          style={{ transform: 'translateZ(-10px)' }}
        />
      </motion.div>
    </section>
  );
};
