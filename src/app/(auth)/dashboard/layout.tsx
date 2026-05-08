'use client';

import { Suspense } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TopNavigation from '@/components/TopNavigation';
import UserSidebar from '@/components/UserSidebar';
import KycGate, { userNeedsKyc } from '@/components/kyc/KycGate';
import { useAuth } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { user } = useAuth();
  const locked = userNeedsKyc(user);
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!locked && (
        <Suspense fallback={null}>
          <UserSidebar />
        </Suspense>
      )}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.mode === 'dark' ? '#0b1020' : '#eef3f8',
          backgroundImage: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 18% 0%, rgba(91, 95, 247, 0.18), transparent 34%), radial-gradient(circle at 85% 12%, rgba(245, 165, 36, 0.10), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px)'
            : 'radial-gradient(circle at 18% 0%, rgba(91, 95, 247, 0.12), transparent 34%), radial-gradient(circle at 90% 6%, rgba(245, 165, 36, 0.12), transparent 30%), linear-gradient(135deg, rgba(17,24,39,0.035) 0 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 42px 42px',
        }}
      >
        <TopNavigation title="Single Audio" />
        <Box 
          component="div" 
          sx={{ 
            flexGrow: 1,
            width: '100%',
            pt: { xs: 2, sm: 3 },
            pb: { xs: 4, lg: 5 },
            px: { xs: 2, sm: 3, lg: 4 },
            maxWidth: 1680,
            mx: 'auto',
          }}
        >
          <KycGate>{children}</KycGate>
        </Box>
      </Box>
    </Box>
  );
}
