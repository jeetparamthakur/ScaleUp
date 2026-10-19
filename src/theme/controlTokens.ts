import { getModeColors, surfaceBorderColor, withAlpha } from './colors';
import type { ThemeMode } from './types';

const CONTROL_HEIGHT = '45px';
const CONTROL_RADIUS = '10px';
const ERROR_COLOR = '#dc2626';

export function getControlCssVariables(mode: ThemeMode): Record<string, string> {
  const colors = getModeColors(mode);
  const border = surfaceBorderColor(mode);

  return {
    '--control-height': CONTROL_HEIGHT,
    '--control-radius': CONTROL_RADIUS,
    '--control-bg': colors.surface,
    '--control-fg': colors.foreground,
    '--control-border': border,
    '--control-border-focus': colors.primary,
    '--control-ring': withAlpha(colors.primary, mode === 'light' ? 0.35 : 0.4),
    '--control-border-error': ERROR_COLOR,
    '--control-fg-error': ERROR_COLOR,
    '--control-placeholder': colors.secondary,
    '--textarea-min-height': '120px',
  };
}
