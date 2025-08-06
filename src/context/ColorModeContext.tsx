'use client';
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme, PaletteMode, Theme } from '@mui/material/styles';

// Define the context type
type ColorModeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

// Create the context
export const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Custom hook to use the color mode
export const useColorMode = () => useContext(ColorModeContext);

// Provider component
export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  // Use state to track the current mode - default to light for SSR
  const [mode, setMode] = useState<PaletteMode>('light');
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
      // Fallback to light mode
      setMode('light');
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
      // Always use light theme during SSR to prevent hydration mismatch
      const themeMode = mounted ? mode : 'light';
      
      return createTheme({
        palette: {
          mode: themeMode as PaletteMode,
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
            default: themeMode === 'light' ? '#f8f9fa' : '#121212',
            paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
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
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
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
                boxShadow: mode === 'light' 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.05)'
                  : '0px 2px 8px rgba(0, 0, 0, 0.2)',
              },
            },
          },
        },
      });
    },
    [mode, mounted]
  );

  // Context value
  const colorModeContextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode, mounted]
  );

  // Prevent flash of wrong theme during SSR
  if (!mounted) {
    // Return a minimal theme provider during SSR
    return (
      <ColorModeContext.Provider value={{ mode: 'light', toggleColorMode: () => {} }}>
        <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }

  // Always render children to prevent hydration mismatch
  return (
    <ColorModeContext.Provider value={colorModeContextValue}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
} 