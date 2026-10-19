import { createTheme, type PaletteMode } from '@mui/material/styles';
import {
  focusRing,
  getModeColors,
  primaryButtonShadow,
  surfaceBorderColor,
} from './colors';
import { getMuiTypographyOptions } from './typography';

export function createAppTheme(mode: PaletteMode) {
  const colors = getModeColors(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
        light: colors.primaryLight,
      },
      secondary: {
        main: colors.secondary,
      },
      info: {
        main: colors.accent,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      divider: surfaceBorderColor(mode),
      text: {
        primary: colors.foreground,
        secondary: colors.secondary,
      },
    },
    typography: getMuiTypographyOptions(),
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: 'none',
          },
          contained: {
            '&.MuiButton-colorPrimary': {
              backgroundColor: `${colors.primary} !important`,
              color: '#ffffff !important',
              backgroundImage: 'none !important',
              boxShadow: 'none !important',
              '@media (hover: hover)': {
                '&:hover': {
                  backgroundColor: `${colors.primaryDark} !important`,
                  boxShadow: `${primaryButtonShadow(mode)} !important`,
                },
              },
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              minHeight: 45,
              maxHeight: 45,
              '& .MuiInputBase-input': {
                paddingTop: '10.5px',
                paddingBottom: '10.5px',
              },
              '&.Mui-focused': {
                boxShadow: focusRing(mode),
              },
            },
          },
        },
      },
    },
  });
}
