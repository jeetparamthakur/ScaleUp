import { getBrandPrimaryFromEnv } from './brandEnv';
import { deriveHeaderGradient } from './deriveBrandPalette';
import { getModeColors, surfaceBorderColor, withAlpha } from './colors';
import { getControlCssVariables } from './controlTokens';
import { getLayoutCssVariables } from './layoutTokens';
import { getTypographyCssVariables } from './typography';
import type { ThemeMode } from './types';

export function getThemeCssVariables(mode: ThemeMode): Record<string, string> {
  const active = getModeColors(mode);

  return {
    ...getTypographyCssVariables(),
    ...getLayoutCssVariables(mode),
    '--theme-primary': active.primary,
    '--theme-primary-dark': active.primaryDark,
    '--theme-primary-light': active.primaryLight,
    '--color-primary': active.primary,
    '--color-primary-dark': active.primaryDark,
    '--color-secondary': active.secondary,
    '--color-accent': active.accent,
    '--background': active.background,
    '--foreground': active.foreground,
    '--surface': active.surface,
    '--surface-border': surfaceBorderColor(mode),
    '--mesh-1': withAlpha(active.primary, mode === 'light' ? 0.06 : 0.08),
    '--header-gradient': deriveHeaderGradient(getBrandPrimaryFromEnv()),
    ...getControlCssVariables(mode),
  };
}

export function applyThemeCssVariables(mode: ThemeMode): void {
  const root = document.documentElement;
  const vars = getThemeCssVariables(mode);

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
