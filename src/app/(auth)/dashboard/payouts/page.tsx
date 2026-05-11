'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AccountBalance, AccountBalanceWallet, ArrowForward, Payment } from '@mui/icons-material';
import AuthGuard from '@/components/AuthGuard';
import { PremiumHeader, PremiumPanel } from '@/components/premium/PremiumSurface';

type Method = 'bank_transfer' | 'paypal';

export default function PayoutsPage() {
  const [method, setMethod] = useState<Method>('bank_transfer');
  const [form, setForm] = useState({
    paypalEmail: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = window.localStorage.getItem('singleaudio-payment-method');
    if (!raw) return;
    try {
      const savedMethod = JSON.parse(raw);
      setMethod(savedMethod.method || 'bank_transfer');
      setForm((prev) => ({ ...prev, ...(savedMethod.details || {}) }));
    } catch {
      // Ignore malformed local state.
    }
  }, []);

  const saveMethod = async () => {
    try {
      setError('');
      const payload = { method, details: form };
      window.localStorage.setItem(
        'singleaudio-payment-method',
        JSON.stringify({ ...payload, updatedAt: new Date().toISOString() })
      );
      await axios.put('/auth/me', { payoutMethod: payload });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment method');
    }
  };

  return (
    <AuthGuard>
      <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
        <PremiumHeader
          eyebrow="Finance"
          title="Payouts"
          description="Add a payment method, request eligible payouts, and review payout history."
          action={
            <Button component={Link} href="/dashboard/royalties?tab=payouts" variant="contained" endIcon={<ArrowForward />}>
              Request Payout
            </Button>
          }
        />

        {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSaved(false)}>Payment method saved.</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' }, gap: 2.5 }}>
          <PremiumPanel sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Payment Method</Typography>
                <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
                  India users should add bank transfer details. International users can use PayPal.
                </Typography>
              </Box>

              <RadioGroup row value={method} onChange={(event) => setMethod(event.target.value as Method)}>
                <FormControlLabel value="bank_transfer" control={<Radio />} label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><AccountBalance /> Bank Transfer</Box>} />
                <FormControlLabel value="paypal" control={<Radio />} label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><Payment /> PayPal</Box>} />
              </RadioGroup>

              {method === 'paypal' ? (
                <TextField
                  label="PayPal Email"
                  type="email"
                  value={form.paypalEmail}
                  onChange={(event) => setForm((prev) => ({ ...prev, paypalEmail: event.target.value }))}
                  fullWidth
                />
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {[
                    ['accountHolderName', 'Account Holder Name'],
                    ['bankName', 'Bank Name'],
                    ['accountNumber', 'Account Number'],
                    ['ifscCode', 'IFSC Code'],
                    ['branchName', 'Branch Name'],
                  ].map(([key, label]) => (
                    <TextField
                      key={key}
                      label={label}
                      value={form[key as keyof typeof form]}
                      onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      fullWidth
                    />
                  ))}
                </Box>
              )}

              <Button variant="contained" onClick={saveMethod} sx={{ alignSelf: 'flex-start' }}>
                Save Payment Method
              </Button>
            </Stack>
          </PremiumPanel>

          <PremiumPanel sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <AccountBalanceWallet sx={{ fontSize: 52, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 900 }}>Minimum payout is $100</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Payout requests are submitted from Royalties after enough balance is available. Saved method details help keep the request flow clear.
              </Typography>
              <Button component={Link} href="/dashboard/royalties?tab=payouts" variant="outlined">
                Open Payout History
              </Button>
            </Stack>
          </PremiumPanel>
        </Box>
      </Box>
    </AuthGuard>
  );
}
