import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from '@/components/ThemeRegistry';
import { env } from '@/config/env';
import { resolveAppFont } from '@/theme/appFont';
import { buildThemeInitScript } from '@/theme/buildThemeInitScript';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const appFont = resolveAppFont(env.fontGoogle);

export const metadata: Metadata = {
  title: env.brandName,
  description: `${env.brandName} platform — production-grade frontend scaffold`,
};

const themeInitScript = buildThemeInitScript();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${appFont.variable} h-full antialiased`}
      style={{ ['--font-family-fallback' as string]: env.fontFamily }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
