import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Save, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  History,
  Info,
  ExternalLink,
  Github,
  Lock,
  Unlock,
  Monitor,
  Search,
  Hash
} from 'lucide-react';
import { ColorWheel } from './components/ColorWheel';
import { ColorTemperature } from './components/ColorTemperature';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { ContrastChecker } from './components/ContrastChecker';
import { TechnicalView } from './components/TechnicalView';
import { BackgroundEffects } from './components/BackgroundEffects';
import { generatePalette, getLuminance, getHarmonyHues, hexToHsl } from './utils/colorUtils';
import { HarmonyType, ColorPalette } from './types';

const HARMONY_DESCRIPTIONS: Record<HarmonyType, string> = {
  monochromatic: "Usa diferentes tonalidades e saturações de uma única cor. É minimalista e sofisticada.",
  analogous: "Cores vizinhas no círculo. Transmite sensação de calma e continuidade.",
  complementary: "Cores opostas. Gera o máximo contraste e destaca elementos.",
  split: "Uma cor base + as duas vizinhas da sua oposta. Oferece contraste, mas com menos agressividade.",
  triadic: "Três cores com a mesma distância entre si. Resultado vibrante e equilibrado.",
  tetradic: "Usa dois pares de cores complementares. Ideal para paletas ricas e coloridas."
};

export default function App() {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [harmony, setHarmony] = useState<HarmonyType>('monochromatic');
  const [projectName, setProjectName] = useState('');
  const [vault, setVault] = useState<ColorPalette[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'modern' | 'technical'>('modern');
  const [showGrid, setShowGrid] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLocked, setIsLocked] = useState(false);
  const [isWallpaperMode, setIsWallpaperMode] = useState(false);
  const [hexInput, setHexInput] = useState('');
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Generate current palette
  const currentColors = useMemo(() => 
    generatePalette(hue, saturation, lightness, harmony),
    [hue, saturation, lightness, harmony]
  );

  const harmonyHues = useMemo(() => 
    getHarmonyHues(hue, harmony),
    [hue, harmony]
  );

  // Load vault and history from local storage
  useEffect(() => {
    const savedVault = localStorage.getItem('colorVault');
    if (savedVault) {
      try {
        setVault(JSON.parse(savedVault));
      } catch (e) {
        console.error("Failed to load vault", e);
      }
    }

    const savedHistory = localStorage.getItem('colorHistory');
    if (savedHistory) {
      try {
        setColorHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const addToHistory = (hex: string) => {
    setColorHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== hex.toLowerCase());
      const newHistory = [hex, ...filtered].slice(0, 20);
      localStorage.setItem('colorHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const savePalette = () => {
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: projectName || `Paleta ${new Date().toLocaleTimeString()}`,
      baseHue: hue,
      saturation,
      lightness,
      harmony,
      colors: currentColors,
      createdAt: Date.now()
    };
    const updatedVault = [newPalette, ...vault];
    setVault(updatedVault);
    localStorage.setItem('colorVault', JSON.stringify(updatedVault));
    setProjectName('');
  };

  const deletePalette = (id: string) => {
    const updatedVault = vault.filter(p => p.id !== id);
    setVault(updatedVault);
    localStorage.setItem('colorVault', JSON.stringify(updatedVault));
  };

  const restorePalette = (p: ColorPalette) => {
    setHue(p.baseHue);
    setSaturation(p.saturation);
    setLightness(p.lightness);
    setHarmony(p.harmony);
  };

  const handleSetAsBase = (hex: string) => {
    const { h, s, l } = hexToHsl(hex);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    addToHistory(hex);
  };

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const performHexSearch = (hexStr: string) => {
    const hex = hexStr.startsWith('#') ? hexStr : `#${hexStr}`;
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(hex)) {
      handleSetAsBase(hex);
      return true;
    }
    return false;
  };

  const handleHexSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (performHexSearch(hexInput)) {
      setHexInput('');
    }
  };

  const handleColorPicked = (hex: string) => {
    handleSetAsBase(hex);
  };

  const handleColorsExtracted = (colors: string[]) => {
    // When colors are extracted from Gemini, we can't easily map back to HSL sliders
    // for all colors, but we'll show them as a special "AI Result" or just update the base
    // For simplicity, let's just update the vault or show them
    const aiPalette: ColorPalette = {
      id: Date.now().toString(),
      name: "Extraído por IA",
      baseHue: hue, // placeholder
      saturation,
      lightness,
      harmony: 'monochromatic', // placeholder
      colors,
      createdAt: Date.now()
    };
    setVault([aiPalette, ...vault]);
    localStorage.setItem('colorVault', JSON.stringify([aiPalette, ...vault]));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#020617] text-slate-50' : 'bg-[#F8F9FA] text-gray-900'} font-sans selection:bg-indigo-100 relative transition-colors duration-300`}>
      {/* Interaction Lock Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[9999] cursor-not-allowed" onClick={(e) => e.stopPropagation()} />
      )}

      {/* Floating Controls for Wallpaper/Lock Mode */}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-4 rounded-full shadow-2xl border transition-all hover:scale-110 ${
            isLocked 
              ? 'bg-rose-600 border-rose-500 text-white' 
              : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-600'
          }`}
          title={isLocked ? "Destravar Interação" : "Travar Interação"}
        >
          {isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
        </button>
        
        <button
          onClick={() => setIsWallpaperMode(!isWallpaperMode)}
          className={`p-4 rounded-full shadow-2xl border transition-all hover:scale-110 ${
            isWallpaperMode 
              ? 'bg-indigo-600 border-indigo-500 text-white' 
              : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-600'
          }`}
          title={isWallpaperMode ? "Sair do Modo Wallpaper" : "Modo Wallpaper"}
        >
          <Monitor className="w-6 h-6" />
        </button>
      </div>

      <BackgroundEffects theme={theme} />
      
      {!isWallpaperMode && (
        <>
          {/* Header */}
          <header className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md sticky top-0 z-50 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Palette className="text-white w-6 h-6" />
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>EriCkolors <span className="text-indigo-600">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-xl border ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-yellow-400' : 'border-gray-200 bg-gray-50 text-gray-500'} transition-all`}
            >
              {theme === 'light' ? <span className="text-xs font-bold uppercase">Escuro</span> : <span className="text-xs font-bold uppercase">Claro</span>}
            </button>
            <div className={`flex ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'} p-1 rounded-xl border mr-2`}>
              <button 
                onClick={() => setViewMode('modern')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'modern' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
              >
                Moderno
              </button>
              <button 
                onClick={() => setViewMode('technical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'technical' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
              >
                Técnico
              </button>
            </div>

            <button 
              onClick={() => setShowHistory(true)}
              className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'} relative`}
              title="Histórico de Cores"
            >
              <History className="w-5 h-5" />
              {colorHistory.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative w-full max-w-sm h-full ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'} border-l shadow-2xl p-6 overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <History className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-gray-900'}`}>Histórico</h2>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              {colorHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Palette className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-800' : 'text-gray-200'} mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'} text-sm`}>Nenhuma cor no histórico ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {colorHistory.map((hex, i) => (
                    <motion.button
                      key={`${hex}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        handleSetAsBase(hex);
                        setShowHistory(false);
                      }}
                      className={`group flex items-center gap-4 p-3 rounded-xl border transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 hover:bg-slate-800' 
                          : 'bg-gray-50 border-gray-200 hover:border-indigo-400 hover:bg-white'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg shadow-inner border border-black/5" 
                        style={{ backgroundColor: hex }}
                      />
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-gray-900'}`}>
                          {hex.toUpperCase()}
                        </div>
                        <div className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                          {i === 0 ? 'Última selecionada' : `Há ${i + 1} seleções`}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-4 h-4 text-indigo-400" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                <button 
                  onClick={() => {
                    setColorHistory([]);
                    localStorage.removeItem('colorHistory');
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Limpar Histórico
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'technical' ? (
          <div className="space-y-8">
            <TechnicalView 
              hue={hue} 
              saturation={saturation} 
              lightness={lightness} 
              harmony={harmony} 
              onHueChange={setHue}
              onSaturationChange={setSaturation}
              onLightnessChange={setLightness}
              onHarmonyChange={setHarmony}
              onHexSearch={performHexSearch}
              currentColors={currentColors}
              showGrid={showGrid}
              onShowGridChange={setShowGrid}
              theme={theme}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ImageAnalyzer onColorPicked={handleColorPicked} theme={theme} />
              </div>
              <div className="lg:col-span-1">
                <ContrastChecker colors={currentColors} theme={theme} onSetAsBase={handleSetAsBase} />
              </div>
              <div className="lg:col-span-1">
                <section className={`${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-100'} p-8 rounded-3xl shadow-sm border flex flex-col h-full transition-colors`}>
                  <div className="flex items-center gap-2 mb-6">
                    <History className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-gray-900'}`}>Cofre de Projetos</h2>
                  </div>
                  <div className="space-y-4 mb-6">
                    <input 
                      type="text" 
                      placeholder="Nome do Projeto..."
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className={`w-full p-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-colors`}
                    />
                    <button 
                      onClick={savePalette}
                      className={`w-full ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-200'} text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg`}
                    >
                      <Save className="w-4 h-4" /> Salvar Paleta
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[300px]">
                    {vault.map((palette) => (
                      <div key={palette.id} className={`p-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-100'} rounded-xl border flex justify-between items-center transition-colors`}>
                        <span className={`text-xs font-bold truncate max-w-[120px] ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{palette.name}</span>
                        <button onClick={() => restorePalette(palette)} className={`text-[10px] ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} font-bold uppercase`}>Carregar</button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ... existing modern view content ... */}
          
          {/* Left Column: Wheel & Controls */}
          <div className="lg:col-span-4 space-y-8">
            <section className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-8 rounded-3xl shadow-sm border flex flex-col items-center transition-colors`}>
              <div className="w-full flex justify-between items-center mb-6">
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'} uppercase tracking-widest`}>Seletor Cromático</span>
                <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'} p-1 rounded-xl border`}>
                  <span className="text-[10px] font-bold text-gray-500 px-2 uppercase">Grade</span>
                  <button 
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${showGrid ? 'bg-indigo-600 text-white shadow-sm' : theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-white text-gray-400 shadow-sm'}`}
                  >
                    {showGrid ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <ColorWheel hue={hue} onChange={setHue} showGrid={showGrid} theme={theme} harmonyHues={harmonyHues} />
              
              <div className="w-full mt-8 space-y-6">
                {/* HEX Search */}
                <form onSubmit={handleHexSearch} className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                    <Hash className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    placeholder="Buscar por HEX (ex: #6366F1)"
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all font-mono`}
                  />
                  <button 
                    type="submit"
                    className="absolute inset-y-1.5 right-1.5 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'} uppercase tracking-wider`}>Matiz</label>
                    <span className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{hue}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="360" value={hue} 
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className={`w-full h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600`}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'} uppercase tracking-wider`}>Saturação</label>
                    <span className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{saturation}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={saturation} 
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className={`w-full h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600`}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'} uppercase tracking-wider`}>Luminosidade</label>
                    <span className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{lightness}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={lightness} 
                    onChange={(e) => setLightness(parseInt(e.target.value))}
                    className={`w-full h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600`}
                  />
                </div>
              </div>
            </section>

            <ImageAnalyzer onColorPicked={handleColorPicked} theme={theme} />
          </div>

          {/* Middle Column: Harmony & Palette */}
          <div className="lg:col-span-5 space-y-8">
            <section className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-8 rounded-3xl shadow-sm border transition-colors`}>
              <div className="flex items-center gap-2 mb-6">
                <Layers className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Harmonia Cromática</h2>
              </div>

              <select 
                value={harmony}
                onChange={(e) => setHarmony(e.target.value as HarmonyType)}
                className={`w-full p-3 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium mb-4`}
              >
                <option value="monochromatic">Monocromática</option>
                <option value="analogous">Análoga</option>
                <option value="complementary">Complementar</option>
                <option value="split">Complementar Decomposta</option>
                <option value="triadic">Tríade</option>
                <option value="tetradic">Tetraédrica</option>
              </select>

              <div className={`${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 text-indigo-900'} p-4 rounded-xl flex gap-3 items-start transition-colors`}>
                <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} mt-0.5 flex-shrink-0`} />
                <p className="text-sm leading-relaxed">
                  {HARMONY_DESCRIPTIONS[harmony]}
                </p>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} uppercase tracking-wider`}>Paleta Gerada</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Clique para copiar • Shift+Clique para definir como base</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentColors.map((color, idx) => {
                    const lum = getLuminance(color);
                    const isColorDark = lum < 0.179;
                    return (
                      <motion.div 
                        key={idx}
                        layoutId={`color-${idx}`}
                        className="group relative h-24 rounded-2xl shadow-sm overflow-hidden cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: color }}
                        onClick={(e) => {
                          if (e.shiftKey) {
                            handleSetAsBase(color);
                          } else {
                            copyToClipboard(color, idx);
                          }
                        }}
                      >
                        <span className={`text-sm font-mono font-bold ${isColorDark ? 'text-white' : 'text-black'}`}>
                          {color.toUpperCase()}
                        </span>
                        <div className={`absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                          {copiedIndex === idx ? (
                            <Check className={`w-6 h-6 ${isColorDark ? 'text-white' : 'text-black'}`} />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Copy className={`w-5 h-5 ${isColorDark ? 'text-white' : 'text-black'}`} />
                              <span className={`text-[8px] font-bold uppercase ${isColorDark ? 'text-white/60' : 'text-black/60'}`}>Copiar</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            <ColorTemperature colors={currentColors} theme={theme} />
            <ContrastChecker colors={currentColors} theme={theme} onSetAsBase={handleSetAsBase} />
          </div>

          {/* Right Column: Vault */}
          <div className="lg:col-span-3 space-y-8">
            <section className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-8 rounded-3xl shadow-sm border h-full flex flex-col transition-colors`}>
              <div className="flex items-center gap-2 mb-6">
                <History className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cofre de Projetos</h2>
              </div>

              <div className="space-y-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Nome do Projeto..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={`w-full p-3 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-colors`}
                />
                <button 
                  onClick={savePalette}
                  className={`w-full ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-200'} text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg`}
                >
                  <Save className="w-4 h-4" /> Salvar Paleta
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[600px]">
                <AnimatePresence initial={false}>
                  {vault.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Palette className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nenhuma paleta salva ainda.</p>
                    </div>
                  ) : (
                    vault.map((palette) => (
                      <motion.div 
                        key={palette.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} rounded-2xl border group transition-colors`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'} truncate pr-2`}>{palette.name}</h4>
                          <button 
                            onClick={() => deletePalette(palette.id)}
                            className="text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-3">
                          {palette.colors.map((c, i) => (
                            <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <button 
                          onClick={() => restorePalette(palette)}
                          className={`w-full py-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-900/50' : 'bg-white border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'} rounded-lg text-xs font-bold transition-all`}
                        >
                          Carregar Paleta
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-12 py-8 border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'} transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>© 2026 EriCkolors Pro. Desenvolvido para designers.</p>
          <div className="flex gap-6">
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-slate-500 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'} flex items-center gap-1`}>
              Documentação <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-slate-500 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'} flex items-center gap-1`}>
              Privacidade <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
        </>
      )}

      {isWallpaperMode && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-lg p-12 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${theme === 'dark' ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-xl rounded-[4rem] p-12 border border-white/10 shadow-2xl`}
            >
              <ColorWheel hue={hue} onChange={setHue} showGrid={showGrid} theme={theme} harmonyHues={harmonyHues} />
              
              <div className="mt-8">
                <form onSubmit={handleHexSearch} className="relative max-w-[200px] mx-auto">
                  <input 
                    type="text"
                    placeholder="#HEX"
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-full text-center text-sm font-mono outline-none focus:ring-2 focus:ring-white/30 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                  />
                </form>
              </div>

              <div className="mt-8 text-center">
                <h1 className={`text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-2`}>
                  {hue}°
                </h1>
                <p className={`text-xs font-bold uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {harmony.replace('-', ' ')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
