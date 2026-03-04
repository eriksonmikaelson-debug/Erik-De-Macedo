/**
 * Utility functions for color conversions and calculations
 */

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getHarmonyHues(h: number, type: string): number[] {
  switch (type) {
    case 'monochromatic':
      return [h];
    case 'analogous':
      return [h, (h + 30) % 360, (h + 330) % 360];
    case 'complementary':
      return [h, (h + 180) % 360];
    case 'split':
      return [h, (h + 150) % 360, (h + 210) % 360];
    case 'triadic':
      return [h, (h + 120) % 360, (h + 240) % 360];
    case 'tetradic':
      return [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
    default:
      return [h];
  }
}

export function generatePalette(h: number, s: number, l: number, type: string): string[] {
  const hues = getHarmonyHues(h, type);
  
  if (type === 'monochromatic') {
    return [
      hslToHex(h, s, Math.max(l - 30, 10)),
      hslToHex(h, s, l),
      hslToHex(h, s, Math.min(l + 30, 90)),
    ];
  }
  
  return hues.map((hue) => hslToHex(hue, s, l));
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  
  let { r, g, b } = rgb;
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function getColorTemperature(h: number): 'warm' | 'cold' {
  // Warm: 0-90 (Red to Yellow) and 270-360 (Magenta to Red)
  // Cold: 90-270 (Green to Blue)
  if (h >= 90 && h <= 270) return 'cold';
  return 'warm';
}
