import React, { useState, useRef, useEffect } from 'react';
import { Upload, Pipette, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageAnalyzerProps {
  onColorPicked: (hex: string) => void;
  theme?: 'light' | 'dark';
}

export const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onColorPicked, theme }) => {
  const isDark = theme === 'dark';
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getColorAtPosition = (e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    if (!canvasRef.current || !imgRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const img = imgRef.current;
    
    // If canvas dimensions don't match image natural dimensions, sync them and redraw
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    }

    const rect = img.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate position relative to the image element
    const x = ((clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((clientY - rect.top) / rect.height) * img.naturalHeight;

    // Safety check for bounds
    if (x < 0 || x >= img.naturalWidth || y < 0 || y >= img.naturalHeight) return null;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    return hex;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPicking) return;
    const hex = getColorAtPosition(e);
    if (hex) setHoverColor(hex);
  };

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPicking) return;
    const hex = getColorAtPosition(e);
    if (hex) {
      onColorPicked(hex);
      setIsPicking(false);
      setHoverColor(null);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setIsPicking(false);
    setHoverColor(null);
    setDominantColors([]);
  };

  const extractDominantColors = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    
    // Create a small temporary canvas for analysis
    const analysisCanvas = document.createElement('canvas');
    const size = 50;
    analysisCanvas.width = size;
    analysisCanvas.height = size;
    const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size).data;
    
    const colorCounts: Record<string, number> = {};
    
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      if (a < 128) continue; // Skip transparent pixels

      // Reduce color space to group similar colors
      const factor = 24;
      const rd = Math.round(r / factor) * factor;
      const gd = Math.round(g / factor) * factor;
      const bd = Math.round(b / factor) * factor;
      
      const hex = `#${((1 << 24) + (rd << 16) + (gd << 8) + bd).toString(16).slice(1)}`;
      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    }

    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    setDominantColors(sortedColors);
  };

  return (
    <div className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-white/20'} backdrop-blur-md p-6 rounded-2xl border shadow-xl transition-colors`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pipette className="w-5 h-5 text-indigo-400" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-50' : 'text-gray-800'}`}>Seleção de Cor em Imagem</h3>
        </div>
        {previewUrl && (
          <button 
            onClick={clearImage}
            className={`p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'} mb-6`}>
        Selecione uma foto e use o conta-gotas para extrair a cor base desejada.
      </p>

      {!previewUrl ? (
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all
            ${isDark ? 'bg-slate-950/50 border-slate-800 group-hover:border-indigo-500 group-hover:bg-slate-900' : 'bg-indigo-50/30 border-indigo-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/50'}
          `}>
            <Upload className={`w-10 h-10 mb-2 text-indigo-400`} />
            <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
              Clique ou arraste uma imagem
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-inner group">
            <img 
              ref={imgRef}
              src={previewUrl} 
              alt="Preview" 
              className={`w-full max-h-[300px] object-contain transition-all ${isPicking ? 'cursor-crosshair' : ''}`}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              onLoad={extractDominantColors}
              referrerPolicy="no-referrer"
            />
            
            <canvas ref={canvasRef} className="hidden" />

            <AnimatePresence>
              {isPicking && hoverColor && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute pointer-events-none flex flex-col items-center gap-2"
                  style={{ 
                    left: '50%', 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full border-4 border-white shadow-2xl" 
                    style={{ backgroundColor: hoverColor }}
                  />
                  <span className="bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-md">
                    {hoverColor.toUpperCase()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {!isPicking && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => setIsPicking(true)}
                  className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                  <Pipette className="w-4 h-4" /> Ativar Conta-gotas
                </button>
              </div>
            )}
          </div>

          {isPicking && (
            <div className={`p-3 rounded-xl text-center text-xs font-medium ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
              Clique em qualquer lugar da imagem para selecionar a cor
            </div>
          )}

          {dominantColors.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                  Cores Dominantes
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Clique para selecionar
                </span>
              </div>
              <div className="flex gap-2">
                {dominantColors.map((color, i) => (
                  <motion.button
                    key={color}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onColorPicked(color)}
                    className="flex-1 aspect-square rounded-lg shadow-sm border border-black/5 hover:scale-105 transition-transform relative group"
                    style={{ backgroundColor: color }}
                    title={color.toUpperCase()}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                      <Pipette className="w-4 h-4 text-white" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
