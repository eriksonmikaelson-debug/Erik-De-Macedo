import React from 'react';
import { ThermometerSun, ThermometerSnowflake } from 'lucide-react';
import { getColorTemperature, hexToHsl } from '../utils/colorUtils';

interface ColorTemperatureProps {
  colors: string[];
  theme?: 'light' | 'dark';
}

export const ColorTemperature: React.FC<ColorTemperatureProps> = ({ colors, theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
        <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          Classificação Térmica
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {colors.map((color, index) => {
          const { h } = hexToHsl(color);
          const temp = getColorTemperature(h);
          const isWarm = temp === 'warm';

          return (
            <div 
              key={index}
              className={`p-3 rounded-2xl border transition-all ${
                isDark 
                  ? 'bg-slate-900/40 border-slate-800' 
                  : 'bg-gray-50 border-gray-100'
              } flex items-center justify-between group hover:border-indigo-500/50`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg shadow-sm border border-white/10" 
                  style={{ backgroundColor: color }} 
                />
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                    {color.toUpperCase()}
                  </span>
                  <span className={`text-[8px] uppercase tracking-tighter ${isWarm ? 'text-orange-500' : 'text-blue-500'} font-bold`}>
                    {isWarm ? 'Quente' : 'Fria'}
                  </span>
                </div>
              </div>
              
              {isWarm ? (
                <ThermometerSun className="w-4 h-4 text-orange-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              ) : (
                <ThermometerSnowflake className="w-4 h-4 text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
