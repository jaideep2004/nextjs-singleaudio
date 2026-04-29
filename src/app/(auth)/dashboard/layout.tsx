'use client';

import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TopNavigation from '@/components/TopNavigation';
import UserSidebar from '@/components/UserSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <UserSidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.mode === 'dark' ? '#0f0f1a' : '#f5f5f5',
        }}
      >
        <TopNavigation title="Karhari Media" />
        <Box 
          component="div" 
          sx={{ 
            flexGrow: 1,
            pt: 3,
            pb: 4,
            px: { xs: 2, sm: 3 }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}