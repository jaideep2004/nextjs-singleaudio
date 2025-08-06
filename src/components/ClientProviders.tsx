'use client';

import { AppContextProvider } from '@/context/AppContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ColorModeProvider } from '@/context/ColorModeContext';
import { CssBaseline, Box } from '@mui/material';
import React from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppContextProvider>
      <NotificationsProvider>
        <ColorModeProvider>
          <CssBaseline />
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        </ColorModeProvider>
      </NotificationsProvider>
    </AppContextProvider>
  );
}
