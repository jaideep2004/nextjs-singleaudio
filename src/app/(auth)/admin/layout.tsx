'use client';

import { Box } from '@mui/material';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useTheme } from '@mui/material/styles';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminSidebar />
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
        <AdminHeader />
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