export type HarmonyType = 'monochromatic' | 'analogous' | 'complementary' | 'split' | 'triadic' | 'tetradic';

export interface ColorPalette {
  id: string;
  name: string;
  baseHue: number;
  saturation: number;
  lightness: number;
  harmony: HarmonyType;
  colors: string[];
  createdAt: number;
}

export interface WCAGResult {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  passAALarge: boolean;
}
