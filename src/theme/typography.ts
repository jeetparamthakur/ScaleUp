import type {
  TypographyStyle,
  TypographyVariantsOptions,
} from '@mui/material/styles';

/** Semantic text roles used across Tailwind utilities, CSS variables, and MUI. */
export type TypographyRole =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subheading'
  | 'subtitle'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'overline'
  | 'label';

export interface TypeStyle {
  fontSize: string;
  lineHeight: string | number;
  fontWeight: number;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase';
}

/**
 * Product typography scale (Operate mode).
 * Values map to CSS vars `--type-<role>-*` and MUI `typography` variants.
 */
export const typographyScale: Record<TypographyRole, TypeStyle> = {
  display: {
    fontSize: '2.25rem',
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },
  h1: {
    fontSize: '1.875rem',
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },
  h2: {
    fontSize: '1.5rem',
    lineHeight: 1.25,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.25rem',
    lineHeight: 1.3,
    fontWeight: 600,
    letterSpacing: '-0.02em',
  },
  h4: {
    fontSize: '1.125rem',
    lineHeight: 1.35,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  subheading: {
    fontSize: '1rem',
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '0.875rem',
    lineHeight: 1.45,
    fontWeight: 600,
  },
  body: {
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  'body-sm': {
    fontSize: '0.8125rem',
    lineHeight: 1.45,
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 500,
  },
  overline: {
    fontSize: '0.6875rem',
    lineHeight: 1.35,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  label: {
    fontSize: '0.875rem',
    lineHeight: 1.25,
    fontWeight: 600,
  },
};

const cssVarPrefix = 'type';

function roleToCssVarBase(role: TypographyRole): string {
  return `--${cssVarPrefix}-${role.replace(/-/g, '-')}`;
}

export function getTypographyCssVariables(): Record<string, string> {
  const vars: Record<string, string> = {
    '--font-sans':
      'var(--font-app), var(--font-inter), var(--font-family-fallback, system-ui, sans-serif)',
    '--font-mono':
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    '--type-prose-max-width': '70ch',
  };

  for (const [role, style] of Object.entries(typographyScale) as [
    TypographyRole,
    TypeStyle,
  ][]) {
    const base = roleToCssVarBase(role);
    vars[`${base}-size`] = style.fontSize;
    vars[`${base}-line-height`] = String(style.lineHeight);
    vars[`${base}-weight`] = String(style.fontWeight);
    if (style.letterSpacing) {
      vars[`${base}-letter-spacing`] = style.letterSpacing;
    }
    if (style.textTransform) {
      vars[`${base}-transform`] = style.textTransform;
    }
  }

  return vars;
}

function toMuiStyle(role: TypographyRole): TypographyStyle {
  const style = typographyScale[role];
  return {
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    ...(style.letterSpacing ? { letterSpacing: style.letterSpacing } : {}),
    ...(style.textTransform ? { textTransform: style.textTransform } : {}),
  };
}

/** MUI typography variants aligned with {@link typographyScale}. */
export function getMuiTypographyOptions(): TypographyVariantsOptions {
  const subheading = typographyScale.subheading;
  const subtitle = typographyScale.subtitle;

  return {
    fontFamily: 'var(--font-sans)',
    h1: toMuiStyle('display'),
    h2: toMuiStyle('h2'),
    h3: toMuiStyle('h3'),
    h4: toMuiStyle('h4'),
    h5: toMuiStyle('h4'),
    h6: toMuiStyle('subtitle'),
    subtitle1: {
      fontSize: subheading.fontSize,
      lineHeight: subheading.lineHeight,
      fontWeight: subheading.fontWeight,
      letterSpacing: subheading.letterSpacing,
    },
    subtitle2: {
      fontSize: subtitle.fontSize,
      lineHeight: subtitle.lineHeight,
      fontWeight: subtitle.fontWeight,
    },
    body1: toMuiStyle('body'),
    body2: toMuiStyle('body-sm'),
    caption: toMuiStyle('caption'),
    overline: toMuiStyle('overline'),
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem' },
  };
}

/** Tailwind / CSS utility class names for each role (see globals.css). */
export const typographyUtilityClass: Record<TypographyRole, string> = {
  display: 'type-display',
  h1: 'type-h1',
  h2: 'type-h2',
  h3: 'type-h3',
  h4: 'type-h4',
  subheading: 'type-subheading',
  subtitle: 'type-subtitle',
  body: 'type-body',
  'body-sm': 'type-body-sm',
  caption: 'type-caption',
  overline: 'type-overline',
  label: 'type-label',
};
