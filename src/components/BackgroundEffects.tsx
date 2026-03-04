import React from 'react';

interface BackgroundEffectsProps {
  theme?: 'light' | 'dark';
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const accentColor = isDark ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.05)';
  const hudColor = isDark ? 'text-indigo-900/40' : 'text-indigo-200';
  const textColor = isDark ? 'text-indigo-700/50' : 'text-indigo-300';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${isDark ? 'opacity-40' : 'opacity-20'} transition-opacity duration-500`}>
      {/* Technical Grid */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, ${accentColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${accentColor} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Top Left HUD Element */}
      <svg className={`absolute -top-20 -left-20 w-[400px] h-[400px] ${hudColor} transition-colors duration-500`} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.2" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
        <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.1" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="0.1" />
        <path d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Bottom Right HUD Element */}
      <svg className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] ${hudColor} transition-colors duration-500`} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.1" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" />
        <g className="animate-[spin_60s_linear_infinite]">
          <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 10" />
        </g>
        <path d="M 100 5 A 95 95 0 0 1 195 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="95" y="5" width="10" height="2" fill="currentColor" />
        <rect x="193" y="95" width="2" height="10" fill="currentColor" />
      </svg>

      {/* Floating Technical Markings */}
      <div className={`absolute top-1/4 right-10 flex flex-col gap-2 text-[8px] font-mono ${textColor} uppercase tracking-widest transition-colors duration-500`}>
        <span>System.Status: Active</span>
        <span>Coord.X: 12.44</span>
        <span>Coord.Y: 88.12</span>
        <div className={`w-12 h-[1px] ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-200'}`} />
      </div>

      <div className={`absolute bottom-1/4 left-10 flex flex-col gap-2 text-[8px] font-mono ${textColor} uppercase tracking-widest transition-colors duration-500`}>
        <span>Color.Engine: V3.1</span>
        <span>Harmony.Sync: Enabled</span>
        <div className={`w-12 h-[1px] ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-200'}`} />
      </div>
    </div>
  );
};
