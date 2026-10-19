import {
  deriveHeaderGradient,
  derivePrimaryScale,
  mixHex,
} from './deriveBrandPalette';

describe('deriveBrandPalette', () => {
  it('derives darker and lighter variants for light mode', () => {
    const scale = derivePrimaryScale('#059669');

    expect(scale.light.primary).toBe('#059669');
    expect(scale.light.primaryDark).toMatch(/^#[0-9A-F]{6}$/);
    expect(scale.light.primaryLight).toMatch(/^#[0-9A-F]{6}$/);
    expect(scale.light.primaryDark).not.toBe(scale.light.primary);
  });

  it('brightens primary for dark mode', () => {
    const scale = derivePrimaryScale('#059669');

    expect(scale.dark.primary).not.toBe(scale.light.primary);
    expect(scale.dark.primaryLight).not.toBe(scale.dark.primary);
  });

  it('builds a header gradient from brand color', () => {
    expect(deriveHeaderGradient('#059669')).toContain('linear-gradient');
  });

  it('mixHex interpolates toward target', () => {
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000');
  });
});
