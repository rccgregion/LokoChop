import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
    >
      {/* Mesh Blob 1: Warm Terracotta #E05A47 */}
      <div 
        className="absolute -top-32 -left-28 w-[520px] h-[520px] rounded-full animate-blob-1"
        style={{
          background: 'radial-gradient(circle, rgba(224, 90, 71, 0.16) 0%, rgba(224, 90, 71, 0) 70%)',
          filter: 'blur(75px)',
        }}
      />

      {/* Mesh Blob 2: Golden Palm #F4A261 */}
      <div 
        className="absolute top-1/3 -right-36 w-[560px] h-[560px] rounded-full animate-blob-2"
        style={{
          background: 'radial-gradient(circle, rgba(244, 162, 97, 0.18) 0%, rgba(244, 162, 97, 0) 70%)',
          filter: 'blur(85px)',
        }}
      />

      {/* Mesh Blob 3: Deep Basil #2A9D8F */}
      <div 
        className="absolute -bottom-32 left-1/4 w-[480px] h-[480px] rounded-full animate-blob-3"
        style={{
          background: 'radial-gradient(circle, rgba(42, 157, 143, 0.14) 0%, rgba(42, 157, 143, 0) 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Subtle Ambient Vignette Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/10 to-surface/40"
      />
    </div>
  );
};
