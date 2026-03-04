import React, { useState, useEffect } from 'react';
import { getContrastRatio } from '../utils/colorUtils';
import { CheckCircle2, XCircle, Info, ArrowLeftRight, MousePointer2 } from 'lucide-react';

interface ContrastCheckerProps {
  colors: string[];
  theme?: 'light' | 'dark';
  onSetAsBase?: (hex: string) => void;
}

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ colors, theme, onSetAsBase }) => {
  const isDark = theme === 'dark';
  const [bgIndex, setBgIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(1);

  // Reset indices if colors change and indices are out of bounds
  useEffect(() => {
    if (bgIndex >= colors.length) setBgIndex(0);
    if (textIndex >= colors.length) setTextIndex(Math.min(1, colors.length - 1));
  }, [colors]);

  if (colors.length < 2) return null;

  const bgColor = colors[bgIndex] || colors[0];
  const textColor = colors[textIndex] || colors[1];
  const ratio = getContrastRatio(bgColor, textColor);
  
  const passAA = ratio >= 4.5;
  const passAAA = ratio >= 7;
  const passAALarge = ratio >= 3;

  const swapColors = () => {
    const temp = bgIndex;
    setBgIndex(textIndex);
    setTextIndex(temp);
  };

  const handleSetBase = (index: number) => {
    setBgIndex(index);
    if (onSetAsBase) {
      onSetAsBase(colors[index]);
    }
  };

  return (
    <div className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-white/20'} backdrop-blur-md p-6 rounded-2xl border shadow-xl transition-colors`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-50' : 'text-gray-800'}`}>Acessibilidade (WCAG)</h3>
        <div className={`px-3 py-1 ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-100 text-indigo-700'} rounded-full text-xs font-bold`}>
          Ratio: {ratio.toFixed(2)}:1
        </div>
      </div>

      {/* Color Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase mb-2 block`}>Fundo (Background)</label>
          <div className={`flex flex-wrap gap-1.5 p-2 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-black/5 border-black/5'} rounded-xl border`}>
            {colors.map((c, i) => (
              <button
                key={i}
                onClick={() => handleSetBase(i)}
                className={`w-6 h-6 rounded-md border-2 transition-all ${bgIndex === i ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
                title="Definir como Fundo e Cor Base"
              />
            ))}
          </div>
        </div>
        <div>
          <label className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase mb-2 block`}>Texto (Foreground)</label>
          <div className={`flex flex-wrap gap-1.5 p-2 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-black/5 border-black/5'} rounded-xl border`}>
            {colors.map((c, i) => (
              <button
                key={i}
                onClick={() => setTextIndex(i)}
                className={`w-6 h-6 rounded-md border-2 transition-all ${textIndex === i ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
                title="Definir como Cor do Texto"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative group mb-6">
        <div 
          className="p-6 rounded-xl flex flex-col items-center justify-center text-center transition-colors duration-500 shadow-inner min-h-[100px]"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <p className="text-lg font-bold">Texto de Exemplo</p>
          <p className="text-sm opacity-80">Como as cores interagem na prática.</p>
        </div>
        <button 
          onClick={swapColors}
          className={`absolute -right-2 top-1/2 -translate-y-1/2 ${isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-white text-gray-900 border-gray-100'} p-2 rounded-full shadow-lg border hover:scale-110 transition-transform z-10`}
          title="Inverter Cores"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-100'} rounded-lg border transition-colors`}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Texto Normal (AA)</span>
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
            </div>
            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Mínimo de 4.5:1 para textos pequenos.</span>
          </div>
          {passAA ? (
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" /> PASS
            </div>
          ) : (
            <div className="flex items-center gap-1 text-rose-500 font-bold text-sm">
              <XCircle className="w-4 h-4" /> FAIL
            </div>
          )}
        </div>

        <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-100'} rounded-lg border transition-colors`}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Texto Normal (AAA)</span>
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
            </div>
            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Mínimo de 7.0:1 para acessibilidade máxima.</span>
          </div>
          {passAAA ? (
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" /> PASS
            </div>
          ) : (
            <div className="flex items-center gap-1 text-rose-500 font-bold text-sm">
              <XCircle className="w-4 h-4" /> FAIL
            </div>
          )}
        </div>

        <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-100'} rounded-lg border transition-colors`}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Texto Grande (AA)</span>
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
            </div>
            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Mínimo de 3.0:1 para títulos e textos &gt; 18pt.</span>
          </div>
          {passAALarge ? (
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" /> PASS
            </div>
          ) : (
            <div className="flex items-center gap-1 text-rose-500 font-bold text-sm">
              <XCircle className="w-4 h-4" /> FAIL
            </div>
          )}
        </div>
      </div>
      
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'} flex items-center gap-2 text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'} uppercase font-bold`}>
        <MousePointer2 className="w-3 h-3" />
        <span>Selecione uma cor de fundo para atualizar a harmonia</span>
      </div>
    </div>
  );
};
