"use client";
import { useEffect, useState } from 'react';
import Providers from '@/components/Providers';
import { Box, CircularProgress } from '@mui/material';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Providers>
  );
}