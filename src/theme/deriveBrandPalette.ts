const HEX_RE = /^#[0-9A-Fa-f]{3,8}$/;

function expandHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return hex;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = expandHex(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function isValidBrandHex(value: string | undefined): value is string {
  return Boolean(value && HEX_RE.test(value));
}

export function mixHex(hex: string, other: string, amount: number): string {
  const a = hexToRgb(expandHex(hex));
  const b = hexToRgb(expandHex(other));
  const t = Math.min(1, Math.max(0, amount));
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bChannel = Math.round(a.b + (b.b - a.b) * t);

  return `#${[r, g, bChannel]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

export interface PrimaryScale {
  primary: string;
  primaryDark: string;
  primaryLight: string;
}

export function derivePrimaryScale(brandPrimary: string): Record<'light' | 'dark', PrimaryScale> {
  const base = expandHex(brandPrimary).toUpperCase();

  return {
    light: {
      primary: base,
      primaryDark: mixHex(base, '#000000', 0.22),
      primaryLight: mixHex(base, '#ffffff', 0.2),
    },
    dark: {
      primary: mixHex(base, '#ffffff', 0.45),
      primaryDark: mixHex(base, '#ffffff', 0.28),
      primaryLight: mixHex(base, '#ffffff', 0.62),
    },
  };
}

/** App chrome header — deep tint of brand primary */
export function deriveHeaderGradient(brandPrimary: string): string {
  const deep = mixHex(brandPrimary, '#000000', 0.88);
  const band = mixHex(brandPrimary, '#000000', 0.72);

  return `linear-gradient(90deg, ${deep} 0%, ${deep} 44%, ${band} 50%, ${deep} 56%, ${deep} 100%)`;
}
