'use client';

import { AppContextProvider } from '@/context/AppContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ColorModeProvider } from '@/context/ColorModeContext';
import React from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppContextProvider>
      <NotificationsProvider>
        <ColorModeProvider>
          {children}
        </ColorModeProvider>
      </NotificationsProvider>
    </AppContextProvider>
  );
}