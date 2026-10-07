import React, { useRef, useState, useCallback } from 'react';

export const HeroHeadline3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 16;

    setTilt({
      rotateX,
      rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1500 block cursor-default select-none py-1"
    >
      <div
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
        className={`relative preserve-3d will-change-transform ${!isHovered ? 'animate-text-float-3d' : ''}`}
      >
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.18] preserve-3d">
          {/* LINE 1: Look Good. */}
          <span
            className="block font-luxury text-stone-950 preserve-3d"
            style={{
              color: '#1a1820',
              textShadow:
                '0 1px 0 #4b445a, 0 2px 0 #3a3347, 0 3px 0 #282233, 0 4px 0 #1b1624, 0 5px 0 #100d16, 0 6px 1px rgba(0,0,0,0.3), 0 0 15px rgba(226,183,85,0.2), 0 12px 24px rgba(0,0,0,0.25)',
              transform: isHovered ? 'translateZ(25px)' : 'translateZ(15px)',
              letterSpacing: '-0.02em',
              transition: 'transform 0.25s ease-out',
            }}
          >
            Look Good.
          </span>

          {/* LINE 2: Feel Great. */}
          <span
            className="block font-serif italic preserve-3d mt-2 sm:mt-3"
            style={{
              color: '#B8860B',
              textShadow:
                '0 1px 0 #fff1c2, 0 2px 0 #f0d175, 0 3px 0 #dbad37, 0 4px 0 #b88a1b, 0 5px 0 #8f670a, 0 6px 1px rgba(0,0,0,0.35), 0 0 22px rgba(226,183,85,0.55), 0 12px 24px rgba(0,0,0,0.25)',
              transform: isHovered ? 'translateZ(45px)' : 'translateZ(30px)',
              letterSpacing: '0.01em',
              transition: 'transform 0.25s ease-out',
            }}
          >
            Feel Great.
          </span>
        </h1>
      </div>
    </div>
  );
};
