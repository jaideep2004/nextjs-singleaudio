'use client';

import { Suspense } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TopNavigation from '@/components/TopNavigation';
import UserSidebar from '@/components/UserSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Suspense fallback={null}>
        <UserSidebar />
      </Suspense>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.mode === 'dark' ? '#0f0f1a' : '#f7f8fb',
        }}
      >
        <TopNavigation title="Karhari Media" />
        <Box 
          component="div" 
          sx={{ 
            flexGrow: 1,
            width: '100%',
            maxWidth: { xs: '100%', lg: 'min(1480px, 100vw - 320px)' },
            mx: 'auto',
            pt: { xs: 2, sm: 3, lg: 4 },
            pb: { xs: 4, lg: 6 },
            px: { xs: 0, sm: 0, lg: 0 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
