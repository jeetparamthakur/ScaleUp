import { env } from '@/config/env';
import {
  derivePrimaryScale,
  isValidBrandHex,
} from './deriveBrandPalette';
import type { ThemeMode } from './types';

export interface ModeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  foreground: string;
  background: string;
  surface: string;
}

const DEFAULT_BRAND_PRIMARY = '#059669';

const DEFAULT_COLORS: Record<ThemeMode, ModeColors> = {
  light: {
    primary: DEFAULT_BRAND_PRIMARY,
    primaryDark: '#047857',
    primaryLight: '#10B981',
    secondary: '#475569',
    accent: '#D946EF',
    foreground: '#0F172A',
    background: '#F8FAFC',
    surface: '#FFFFFF',
  },
  dark: {
    primary: '#34D399',
    primaryDark: '#10B981',
    primaryLight: '#6EE7B7',
    secondary: '#94A3B8',
    accent: '#E879F9',
    foreground: '#F8FAFC',
    background: '#0F172A',
    surface: '#1E293B',
  },
};

function readEnvColor(
  mode: ThemeMode,
  token: keyof ModeColors,
  fallback?: string,
): string {
  const envKey = `NEXT_PUBLIC_THEME_${mode.toUpperCase()}_${token
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()}`;
  const value = process.env[envKey];

  if (value && /^#[0-9A-Fa-f]{3,8}$/.test(value)) {
    return value;
  }

  if (fallback) {
    return fallback;
  }

  return DEFAULT_COLORS[mode][token];
}

function resolveDerivedDefaults(): Record<ThemeMode, ModeColors> {
  const brandPrimary = isValidBrandHex(env.brandPrimary)
    ? env.brandPrimary
    : DEFAULT_BRAND_PRIMARY;
  const derived = derivePrimaryScale(brandPrimary);

  const buildMode = (mode: ThemeMode): ModeColors => {
    const fromBrand = derived[mode];

    return {
      primary: readEnvColor(mode, 'primary', fromBrand.primary),
      primaryDark: readEnvColor(mode, 'primaryDark', fromBrand.primaryDark),
      primaryLight: readEnvColor(mode, 'primaryLight', fromBrand.primaryLight),
      secondary: readEnvColor(mode, 'secondary'),
      accent: readEnvColor(mode, 'accent'),
      foreground: readEnvColor(mode, 'foreground'),
      background: readEnvColor(mode, 'background'),
      surface: readEnvColor(mode, 'surface'),
    };
  };

  return {
    light: buildMode('light'),
    dark: buildMode('dark'),
  };
}

export function getBrandColorsFromEnv(): Record<ThemeMode, ModeColors> {
  return resolveDerivedDefaults();
}

export function getBrandPrimaryFromEnv(): string {
  return isValidBrandHex(env.brandPrimary)
    ? env.brandPrimary
    : DEFAULT_BRAND_PRIMARY;
}

export function getBrandNameFromEnv(): string {
  return env.brandName;
}

export function getLoginHeroImageFromEnv(): string {
  return env.loginHeroImage;
}
