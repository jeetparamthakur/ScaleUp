/** Layout, radius, and elevation tokens (mode-independent). */
export const layoutTokens = {
  contentMaxWidth: '64rem',
  panelRadius: '16px',
  buttonRadius: '10px',
  controlHeight: '45px',
  spacingSection: '2rem',
  spacingStack: '1rem',
  shadowPanelLight: '0 1px 2px rgba(15, 23, 42, 0.04)',
  shadowPanelDark: '0 1px 2px rgba(0, 0, 0, 0.24)',
} as const;

export function getLayoutCssVariables(mode: 'light' | 'dark'): Record<string, string> {
  return {
    '--layout-content-max-width': layoutTokens.contentMaxWidth,
    '--radius-panel': layoutTokens.panelRadius,
    '--radius-button': layoutTokens.buttonRadius,
    '--spacing-section': layoutTokens.spacingSection,
    '--spacing-stack': layoutTokens.spacingStack,
    '--shadow-panel':
      mode === 'light'
        ? layoutTokens.shadowPanelLight
        : layoutTokens.shadowPanelDark,
  };
}
