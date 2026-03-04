import React from 'react';
import { motion } from 'motion/react';
import { HarmonyType } from '../types';
import { ColorTemperature } from './ColorTemperature';
import { getHarmonyHues, getLuminance } from '../utils/colorUtils';

interface TechnicalViewProps {
  hue: number;
  saturation: number;
  lightness: number;
  harmony: HarmonyType;
  onHueChange: (hue: number) => void;
  onSaturationChange: (saturation: number) => void;
  onLightnessChange: (lightness: number) => void;
  onHarmonyChange?: (harmony: HarmonyType) => void;
  currentColors: string[];
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  theme?: 'light' | 'dark';
  onHexSearch?: (hex: string) => void;
}

export const TechnicalView: React.FC<TechnicalViewProps> = ({
  hue,
  saturation,
  lightness,
  harmony,
  onHueChange,
  onSaturationChange,
  onLightnessChange,
  onHarmonyChange,
  currentColors,
  showGrid,
  onShowGridChange,
  theme,
  onHexSearch
}) => {
  const isDark = theme === 'dark';
  const hues = getHarmonyHues(hue, harmony);
  const [localHex, setLocalHex] = React.useState('');

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onHexSearch) {
      onHexSearch(localHex);
      setLocalHex('');
    }
  };

  const renderHarmonyShape = () => {
    const radius = 120;
    const points = hues.map(h => {
      const angleRad = (h - 90) * (Math.PI / 180);
      return {
        x: Math.cos(angleRad) * radius,
        y: Math.sin(angleRad) * radius
      };
    });

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <g transform="translate(150, 150)">
          {/* Shape lines */}
          {points.length > 1 && (
            <path
              d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}
          {/* Connection points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="8"
              fill="transparent"
              stroke="white"
              strokeWidth="3"
              className="shadow-sm"
            />
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div className={`w-full min-h-[700px] ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200'} relative overflow-hidden rounded-3xl shadow-inner p-8 font-mono transition-colors`}>
      {/* Technical Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-4">
          <div className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase tracking-[0.2em]`}>
            Ref: {new Date().getFullYear()}.COLOR.SYS
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200'} p-1 rounded-xl border`}>
              <span className="text-[10px] font-bold text-gray-500 px-2 uppercase">Grade</span>
              <button 
                onClick={() => onShowGridChange?.(!showGrid)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${showGrid ? 'bg-indigo-600 text-white shadow-sm' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-400 shadow-sm'}`}
              >
                {showGrid ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
        <h2 className={`text-3xl font-black tracking-widest ${isDark ? 'text-slate-50' : 'text-gray-800'} mb-2 uppercase`}>EriCkolors</h2>
        <div className={`w-24 h-1 ${isDark ? 'bg-indigo-500' : 'bg-gray-800'} mb-12`} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full max-w-5xl items-center">
          
          {/* Left Side: HSL Controls & Search */}
          <div className={`space-y-8 text-[10px] uppercase tracking-tighter ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {/* Harmony Selector First */}
            <div className={`flex flex-col gap-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200'} p-3 rounded-xl border`}>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Harmonia</span>
              <select 
                value={harmony}
                onChange={(e) => onHarmonyChange?.(e.target.value as HarmonyType)}
                className={`w-full bg-transparent text-[10px] font-bold outline-none ${isDark ? 'text-slate-200' : 'text-gray-700'}`}
              >
                <option value="monochromatic">Monocromática</option>
                <option value="analogous">Análoga</option>
                <option value="complementary">Complementar</option>
                <option value="split">Complementar Decomposta</option>
                <option value="triadic">Tríade</option>
                <option value="tetradic">Tetraédrica</option>
              </select>
            </div>

            {/* HSL Controls */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-indigo-500" />
                <span className={`font-bold tracking-widest ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>Ajustes de Cores</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase`}>Matiz (Hue)</label>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{hue}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="360" value={hue}
                    onChange={(e) => onHueChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase`}>Saturação</label>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{saturation}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={saturation}
                    onChange={(e) => onSaturationChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase`}>Luminosidade</label>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{lightness}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={lightness}
                    onChange={(e) => onLightnessChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              <form onSubmit={handleLocalSubmit} className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-gray-300'}`}>
                  <span className="text-[10px] font-bold">#</span>
                </div>
                <input 
                  type="text"
                  placeholder="Buscar por HEX (ex: #6366F1)"
                  value={localHex}
                  onChange={(e) => setLocalHex(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-gray-50 border-gray-200 text-gray-700'} rounded-lg border focus:ring-1 focus:ring-indigo-500 outline-none text-[10px] font-bold transition-all uppercase`}
                />
              </form>

              {/* Integrated Palette Display */}
              <div className="pt-4 border-t border-slate-800/50">
                <div className="grid grid-cols-3 gap-2">
                  {currentColors.map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-8 w-full border border-slate-800/50" style={{ backgroundColor: c }} />
                      <div className={`text-[8px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{c.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center: The Technical Wheel */}
          <div className="flex flex-col items-center">
            <div className="relative w-[300px] h-[300px]">
              {/* Outer Ring Labels */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
                const labels: Record<number, string> = {
                  0: 'Vermelho', 30: 'Laranja', 60: 'Amarelo', 90: 'Verde', 
                  120: 'Verde', 150: 'Azul', 180: 'Azul', 210: 'Violeta',
                  240: 'Violeta', 270: 'Vermelho', 300: 'Vermelho', 330: 'Laranja'
                };
                const angleRad = (a - 90) * (Math.PI / 180);
                const x = Math.cos(angleRad) * 165;
                const y = Math.sin(angleRad) * 165;
                return (
                  <div 
                    key={a}
                    className={`absolute text-[8px] font-bold ${isDark ? 'text-slate-500' : 'text-gray-400'} uppercase`}
                    style={{ 
                      left: '50%', top: '50%', 
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${a}deg)` 
                    }}
                  >
                    {labels[a]}
                  </div>
                );
              })}

              {/* The Wheel */}
              <div 
                className={`w-full h-full rounded-full border-4 ${isDark ? 'border-slate-800' : 'border-gray-100'} shadow-xl relative cursor-crosshair overflow-hidden`}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left - rect.width / 2;
                  const y = e.clientY - rect.top - rect.height / 2;
                  let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
                  if (angle < 0) angle += 360;
                  onHueChange(Math.round(angle));
                }}
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
                {/* Grid Lines */}
                {showGrid && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                    <g transform="translate(150, 150)">
                      {[...Array(12)].map((_, i) => (
                        <line
                          key={i}
                          x1="0" y1="0"
                          x2="0" y2="-150"
                          stroke={isDark ? "rgba(255,255,255,0.3)" : "white"}
                          strokeWidth="1.5"
                          transform={`rotate(${i * 30})`}
                        />
                      ))}
                    </g>
                  </svg>
                )}

                {/* Concentric Rings */}
                <div className={`absolute inset-0 border ${isDark ? 'border-white/10' : 'border-black/5'} rounded-full`} />
                <div className={`absolute inset-8 border ${isDark ? 'border-white/10' : 'border-black/5'} rounded-full`} />
                <div className={`absolute inset-16 border ${isDark ? 'border-white/10' : 'border-black/5'} rounded-full`} />
                <div className={`absolute inset-24 border ${isDark ? 'border-white/10' : 'border-black/5'} rounded-full`} />
                <div className={`absolute inset-[110px] ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'} rounded-full border transition-colors`} />
              </div>

              {/* Harmony Overlay */}
              {renderHarmonyShape()}
            </div>
          </div>

          {/* Right Side: Harmony Diagrams & Info */}
          <div className={`space-y-10 text-[10px] uppercase tracking-tighter ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <div className={`border-r-2 ${isDark ? 'border-slate-800' : 'border-gray-200'} pr-4 text-right group transition-all hover:border-indigo-500`}>
              <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'} mb-1`}>Complementar</p>
              <p className="opacity-60">Contraste Máximo / 180°</p>
              <div className={`w-20 h-20 mt-3 border ${isDark ? 'border-slate-800' : 'border-gray-200'} ml-auto relative overflow-hidden bg-slate-950/20`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-[1px] bg-indigo-500/30 rotate-45" />
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] border border-white/20" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/40" />
                </div>
                <div className="absolute bottom-1 left-1 text-[6px] opacity-40">REF: COMP_01</div>
              </div>
            </div>

            <div className={`border-r-2 ${isDark ? 'border-slate-800' : 'border-gray-200'} pr-4 text-right group transition-all hover:border-indigo-500`}>
              <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'} mb-1`}>Tríade</p>
              <p className="opacity-60">Equilíbrio / 120°</p>
              <div className={`w-20 h-20 mt-3 border ${isDark ? 'border-slate-800' : 'border-gray-200'} ml-auto relative bg-slate-950/20`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border border-indigo-500/20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 border border-white/20" />
                  <div className="absolute bottom-3 left-4 w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/40" />
                  <div className="absolute bottom-3 right-4 w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/40" />
                </div>
                <div className="absolute bottom-1 left-1 text-[6px] opacity-40">REF: TRID_03</div>
              </div>
            </div>

            <div className={`border-r-2 ${isDark ? 'border-slate-800' : 'border-gray-200'} pr-4 text-right group transition-all hover:border-indigo-500`}>
              <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'} mb-1`}>Análoga</p>
              <p className="opacity-60">Vizinhança / 30°</p>
              <div className={`w-20 h-20 mt-3 border ${isDark ? 'border-slate-800' : 'border-gray-200'} ml-auto relative bg-slate-950/20`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-14 border-t-2 border-indigo-500/20 rounded-full" style={{ clipPath: 'inset(0 0 60% 0)' }} />
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 border border-white/20" />
                  <div className="absolute top-5 left-[25%] w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/40" />
                  <div className="absolute top-5 right-[25%] w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/40" />
                </div>
                <div className="absolute bottom-1 left-1 text-[6px] opacity-40">REF: ANAL_05</div>
              </div>
            </div>

            <div className={`border-r-2 ${isDark ? 'border-slate-800' : 'border-gray-200'} pr-4 text-right group transition-all hover:border-indigo-500`}>
              <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'} mb-1`}>Tetrádica</p>
              <p className="opacity-60">Complexidade / 90°</p>
              <div className={`w-20 h-20 mt-3 border ${isDark ? 'border-slate-800' : 'border-gray-200'} ml-auto relative bg-slate-950/20`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border border-indigo-500/20" />
                  <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-indigo-500 border border-white/20" />
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/40" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/40" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/40" />
                </div>
                <div className="absolute bottom-1 left-1 text-[6px] opacity-40">REF: TETR_04</div>
              </div>
            </div>
          </div>
        </div>

        {/* Temperature Classification */}
        <ColorTemperature colors={currentColors} theme={theme} />
      </div>
    </div>
  );
};
