'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TopNavigation from '@/components/TopNavigation';
import UserSidebar from '@/components/UserSidebar';
import KycGate, { userKycUnderReview, userNeedsKyc } from '@/components/kyc/KycGate';
import { useAuth } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();
  const needsKycForm = userNeedsKyc(user);
  const underReview = userKycUnderReview(user);
  const reviewAllowed = pathname === '/dashboard' || pathname.startsWith('/dashboard/profile');
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!needsKycForm && (
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
          {!needsKycForm && underReview && (
            <Alert severity="info" sx={{ mt: 2, mb: 2, borderRadius: 2 }}>
              KYC verification under progress. Dashboard actions unlock after admin approval.
            </Alert>
          )}
          {!needsKycForm && underReview && !reviewAllowed ? (
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                maxWidth: 720,
                mx: 'auto',
                textAlign: 'center',
                bgcolor: 'background.paper',
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Typography variant="h5" fontWeight={900}>KYC Verification Under Progress</Typography>
                <Typography color="text.secondary">
                  This section is locked until admin approves your KYC. You can still view dashboard status and profile details.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button component={Link} href="/dashboard" variant="contained">Open Dashboard</Button>
                  <Button component={Link} href="/dashboard/profile" variant="outlined">Open Profile</Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <KycGate>{children}</KycGate>
          )}
        </Box>
      </Box>
    </Box>
  );
}
