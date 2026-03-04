import React, { useRef, useEffect, useState } from 'react';

interface ColorWheelProps {
  hue: number;
  onChange: (hue: number) => void;
  showGrid?: boolean;
  theme?: 'light' | 'dark';
  harmonyHues?: number[];
}

export const ColorWheel: React.FC<ColorWheelProps> = ({ hue, onChange, showGrid, theme, harmonyHues = [] }) => {
  const isDark = theme === 'dark';
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateHue = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    onChange(Math.round(angle));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    calculateHue(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        calculateHue(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Helper to get coordinates for a hue
  const getCoords = (h: number, r: number) => {
    const angleRad = (h - 90) * (Math.PI / 180);
    return {
      x: Math.cos(angleRad) * r,
      y: Math.sin(angleRad) * r
    };
  };

  const radius = 110;
  const mainMarker = getCoords(hue, radius);

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={wheelRef}
        onMouseDown={handleMouseDown}
        className="w-64 h-64 rounded-full cursor-crosshair shadow-2xl relative"
        style={{
          background: `conic-gradient(
            hsl(0, 100%, 50%), hsl(30, 100%, 50%), hsl(60, 100%, 50%),
            hsl(90, 100%, 50%), hsl(120, 100%, 50%), hsl(150, 100%, 50%),
            hsl(180, 100%, 50%), hsl(210, 100%, 50%), hsl(240, 100%, 50%),
            hsl(270, 100%, 50%), hsl(300, 100%, 50%), hsl(330, 100%, 50%),
            hsl(360, 100%, 50%)
          )`
        }}
      >
        {/* Center hole for a more modern look */}
        <div className={`absolute inset-12 ${isDark ? 'bg-slate-900/40' : 'bg-white/10'} backdrop-blur-sm rounded-full pointer-events-none border ${isDark ? 'border-slate-700/50' : 'border-white/20'} shadow-inner transition-colors`} />
        
        {/* Grid Overlay */}
        {showGrid && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <g transform="translate(128, 128)">
              {[...Array(12)].map((_, i) => (
                <line
                  key={i}
                  x1="0" y1="0"
                  x2="0" y2="-128"
                  stroke="white"
                  strokeWidth="1"
                  transform={`rotate(${i * 30})`}
                />
              ))}
              <circle cx="0" cy="0" r="128" fill="none" stroke="white" strokeWidth="1" />
              <circle cx="0" cy="0" r="96" fill="none" stroke="white" strokeWidth="1" />
              <circle cx="0" cy="0" r="64" fill="none" stroke="white" strokeWidth="1" />
            </g>
          </svg>
        )}

        {/* Harmonic Markers */}
        {harmonyHues.map((h, i) => {
          if (Math.round(h) === Math.round(hue)) return null; // Skip main hue
          const coords = getCoords(h, radius);
          return (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white/80 border border-black/50 rounded-full shadow-md pointer-events-none transition-transform duration-300"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${coords.x}px), calc(-50% + ${coords.y}px))`
              }}
            />
          );
        })}

        {/* Main Marker */}
        <div
          className="absolute w-6 h-6 bg-white border-2 border-black rounded-full shadow-lg pointer-events-none transition-transform duration-75 z-10"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${mainMarker.x}px), calc(-50% + ${mainMarker.y}px))`
          }}
        >
          <div className="absolute inset-1 border border-black/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};
