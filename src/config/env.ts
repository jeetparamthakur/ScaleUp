/**
 * Frontend env config — values come from `.env` at dev/build time.
 * Client-safe vars must use the NEXT_PUBLIC_ prefix.
 */
export const env = {
  backendInternalUrl:
    process.env.MARKOS_BACKEND_INTERNAL_URL ?? 'http://localhost:3008',
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Markos',
  /**
   * Single brand accent — drives primary buttons, links, focus rings, and derived shades.
   * Optional per-token overrides: NEXT_PUBLIC_THEME_LIGHT_PRIMARY, etc.
   */
  brandPrimary: process.env.NEXT_PUBLIC_BRAND_PRIMARY,
  loginHeroImage:
    process.env.NEXT_PUBLIC_LOGIN_HERO_IMAGE ?? '/images/login-hero.jpg',
  /** CSS font stack appended after the loaded web font variable */
  fontFamily:
    process.env.NEXT_PUBLIC_FONT_FAMILY ??
    'Inter, system-ui, -apple-system, sans-serif',
  /**
   * Google font family name for next/font (e.g. Inter, Plus Jakarta Sans).
   * Must match a supported id in `src/theme/appFont.ts`.
   */
  fontGoogle: process.env.NEXT_PUBLIC_FONT_GOOGLE ?? 'Inter',
} as const;
