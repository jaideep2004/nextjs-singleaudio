'use client';

import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import { AccountBalanceWallet, ArrowForward, RequestQuote } from '@mui/icons-material';
import AuthGuard from '@/components/AuthGuard';
import { PremiumHeader, PremiumPanel } from '@/components/premium/PremiumSurface';

export default function PayoutsPage() {
  return (
    <AuthGuard>
      <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
        <PremiumHeader
          eyebrow="Finance"
          title="Payouts"
          description="Request payouts and review payment history from the Royalties workspace."
          action={<Button
            component={Link}
            href="/dashboard/royalties?tab=payouts"
            variant="contained"
            endIcon={<ArrowForward />}
          >
            Open Payout Center
          </Button>}
        />

        <PremiumPanel
          sx={{
            p: { xs: 3, md: 4 },
            minHeight: 360,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box>
            <AccountBalanceWallet sx={{ fontSize: 58, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={850}>Payout tools are inside Royalties</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
              Your available balance, payout request form, and payout history live together with royalty reports.
            </Typography>
            <Button
              component={Link}
              href="/dashboard/royalties?tab=payouts"
              variant="outlined"
              startIcon={<RequestQuote />}
              sx={{ mt: 3 }}
            >
              Request payout
            </Button>
          </Box>
        </PremiumPanel>
      </Box>
    </AuthGuard>
  );
}
