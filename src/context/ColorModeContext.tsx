'use client';
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  const [mounted, setMounted] = useState(false);

  // Initialize mode from localStorage or system preference
  useEffect(() => {
    // Mark as mounted first to prevent hydration mismatch
    setMounted(true);
    
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
      return createTheme({
        palette: {
          mode,
          primary: {
            main: '#4a6cf7',
            light: '#6b8af8',
            dark: '#3451c6',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f5a623',
            light: '#f7b84e',
            dark: '#d48c1a',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'dark' ? '#0f0f1a' : '#f5f5f5',
            paper: mode === 'dark' ? '#1a1a2e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              colorDefault: {
                backgroundColor: mode === 'dark' ? '#1a1a2e' : '#ffffff',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                backgroundImage: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
              outlined: {
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
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
        <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
          {children}
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}