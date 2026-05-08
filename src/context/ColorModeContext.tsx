'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme, PaletteMode, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Define the context type
type ColorModeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

// Create the context
export const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
});

// Custom hook to use the color mode
export const useColorMode = () => useContext(ColorModeContext);

// Provider component
export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  // Use state to track the current mode - default to dark
  const [mode, setMode] = useState<PaletteMode>('dark');

  // Initialize mode from localStorage or system preference
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('colorMode') as PaletteMode | null;
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        setMode(savedMode);
      } else {
        // Check system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemMode = prefersDarkMode ? 'dark' : 'light';
        setMode(systemMode);
        // Save system preference to localStorage
        localStorage.setItem('colorMode', systemMode);
      }
    } catch (error) {
      console.error('Error initializing color mode:', error);
      // Fallback to dark mode
      setMode('dark');
    }
  }, []);

  // Toggle function
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('colorMode', newMode);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      return newMode;
    });
  };

  // Create a theme with the current mode
  const theme = useMemo(
    () => {
      const isDark = mode === 'dark';
      const textPrimary = isDark ? '#f7f3e8' : '#111827';
      const textSecondary = isDark ? 'rgba(247, 243, 232, 0.68)' : '#536173';
      const divider = isDark ? 'rgba(247, 243, 232, 0.12)' : 'rgba(17, 24, 39, 0.10)';

      return createTheme({
        palette: {
          mode,
          primary: {
            main: '#5b5ff7',
            light: '#8588ff',
            dark: '#3438c7',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f5a524',
            light: '#ffc45c',
            dark: '#c77b05',
            contrastText: '#121212',
          },
          success: {
            main: '#21c58b',
            light: '#59dcae',
            dark: '#0b8f62',
          },
          warning: {
            main: '#f5a524',
            light: '#ffc45c',
            dark: '#c77b05',
          },
          error: {
            main: '#f2556b',
            light: '#ff8495',
            dark: '#be233d',
          },
          info: {
            main: '#35a7d8',
            light: '#73c7ea',
            dark: '#157da8',
          },
          background: {
            default: isDark ? '#0b1020' : '#eef3f8',
            paper: isDark ? '#121a2b' : '#ffffff',
          },
          text: {
            primary: textPrimary,
            secondary: textSecondary,
          },
          divider,
        },
        shape: {
          borderRadius: 14,
        },
        typography: {
          fontFamily: '"Plus Jakarta Sans", "DM Sans", "Segoe UI", sans-serif',
          h1: {
            fontWeight: 850,
            letterSpacing: 0,
          },
          h2: {
            fontWeight: 850,
            letterSpacing: 0,
          },
          h3: {
            fontWeight: 800,
            letterSpacing: 0,
          },
          h4: {
            fontWeight: 800,
            letterSpacing: 0,
          },
          h5: {
            fontWeight: 760,
            letterSpacing: 0,
          },
          h6: {
            fontWeight: 740,
            letterSpacing: 0,
          },
          button: {
            fontWeight: 800,
            letterSpacing: 0,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: isDark ? '#0b1020' : '#eef3f8',
                color: textPrimary,
              },
              '::selection': {
                backgroundColor: isDark ? 'rgba(91, 95, 247, 0.42)' : 'rgba(91, 95, 247, 0.24)',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              colorDefault: {
                backgroundColor: isDark ? '#11192b' : '#ffffff',
                color: textPrimary,
                borderBottom: `1px solid ${divider}`,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                textTransform: 'none',
                fontWeight: 800,
                minHeight: 42,
                touchAction: 'manipulation',
              },
              contained: {
                boxShadow: isDark
                  ? '0 12px 28px rgba(91, 95, 247, 0.28)'
                  : '0 12px 24px rgba(91, 95, 247, 0.18)',
                '&:hover': {
                  boxShadow: isDark
                    ? '0 18px 36px rgba(91, 95, 247, 0.34)'
                    : '0 16px 28px rgba(91, 95, 247, 0.24)',
                },
              },
              outlined: {
                borderColor: divider,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 18,
                backgroundImage: 'none',
                backgroundColor: isDark ? '#121a2b' : '#ffffff',
                border: `1px solid ${divider}`,
                boxShadow: isDark
                  ? '0 22px 52px rgba(0, 0, 0, 0.32)'
                  : '0 22px 52px rgba(27, 39, 68, 0.09)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                color: textPrimary,
              },
              outlined: {
                borderColor: divider,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                fontWeight: 800,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottomColor: divider,
                color: textPrimary,
              },
              head: {
                color: textSecondary,
                fontWeight: 850,
                letterSpacing: 0,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                backgroundColor: isDark ? 'rgba(247, 243, 232, 0.035)' : '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(247, 243, 232, 0.24)' : 'rgba(17, 24, 39, 0.22)',
                },
              },
              input: {
                color: textPrimary,
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: textSecondary,
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
                border: `1px solid ${divider}`,
                backgroundImage: 'none',
              },
            },
          },
        },
      });
    },
    [mode]
  );

  // Context value
  const colorModeContextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode]
  );

  // Always render children to prevent hydration mismatch
  return (
    <ColorModeContext.Provider value={colorModeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
