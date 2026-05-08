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
          bgcolor: theme.palette.mode === 'dark' ? '#0b1020' : '#eef3f8',
          backgroundImage: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 16% 0%, rgba(242, 85, 107, 0.16), transparent 32%), radial-gradient(circle at 82% 10%, rgba(91, 95, 247, 0.12), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px)'
            : 'radial-gradient(circle at 16% 0%, rgba(242, 85, 107, 0.10), transparent 32%), radial-gradient(circle at 86% 8%, rgba(91, 95, 247, 0.11), transparent 30%), linear-gradient(135deg, rgba(17,24,39,0.035) 0 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 42px 42px',
        }}
      >
        <AdminHeader />
        <Box 
          component="div" 
          sx={{ 
            flexGrow: 1,
            width: '100%',
            pt: { xs: 1.5, sm: 2 },
            pb: { xs: 4, lg: 5 },
            px: { xs: 1.5, sm: 2.5, lg: 3 },
            maxWidth: 1680,
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
