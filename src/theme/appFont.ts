import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  variable: '--font-app',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-app',
  subsets: ['latin'],
  display: 'swap',
});

const FONT_REGISTRY: Record<string, { variable: string; className: string }> = {
  Inter: inter,
  'Plus Jakarta Sans': plusJakarta,
};

export function resolveAppFont(googleName: string): {
  variable: string;
  className: string;
} {
  const entry = FONT_REGISTRY[googleName];
  if (entry) {
    return entry;
  }

  return inter;
}
