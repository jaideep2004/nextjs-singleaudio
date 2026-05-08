'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircle, HourglassTop, ShieldOutlined } from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';

type Provider = 'surepass' | 'sandbox' | 'manual';

const isArtistOrLabel = (role?: string) => role === 'artist' || role === 'label';

export function userNeedsKyc(user: ReturnType<typeof useAuth>['user']) {
  if (!user || !isArtistOrLabel(user.role)) return false;
  return user.verification?.status !== 'approved';
}

export default function KycGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    accountType: user?.accountType || (user?.role === 'label' ? 'label' : 'artist'),
    artistName: user?.artistName || user?.name || '',
    legalName: user?.name || '',
    idType: 'pan',
    idNumber: '',
    legalAddress: '',
    phoneNumber: user?.verification?.phoneNumber || '',
    numberOfTracks: '0',
    numberOfReleases: '0',
    labelName: user?.artistName || user?.name || '',
    registrationType: 'individual',
    totalArtists: '0',
    totalRevenue: '0',
    catalogSize: '0',
    rightsType: 'non_exclusive',
    mobileVerificationProvider: (user?.verification?.mobileProvider as Provider) || 'sandbox',
    kycProvider: (user?.verification?.kycProvider as Provider) || 'sandbox',
    kycConsent: Boolean(user?.verification?.consent),
  });

  const status = user?.verification?.status || 'pending';
  const needsKyc = userNeedsKyc(user);

  const statusMeta = useMemo(() => {
    if (status === 'submitted') return { label: 'Submitted for review', color: 'warning' as const };
    if (status === 'rejected') return { label: 'Rejected', color: 'error' as const };
    return { label: 'KYC required', color: 'info' as const };
  }, [status]);

  if (!needsKyc) return <>{children}</>;

  const setValue = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitKyc = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.kycConsent) {
      setError('Consent is required before submitting KYC.');
      return;
    }

    if (!form.phoneNumber.trim() || !form.legalAddress.trim()) {
      setError('Phone number and legal address are required.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/auth/me/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.success) throw new Error(json?.message || json?.error || 'KYC submission failed');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'KYC submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 60px)',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        bgcolor: isDark ? '#0f1724' : '#eef3f8',
      }}
    >
      <Paper
        component="form"
        onSubmit={submitKyc}
        sx={{
          width: '100%',
          maxWidth: 1080,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
          boxShadow: isDark ? '0 24px 70px rgba(0,0,0,0.34)' : '0 24px 70px rgba(15,23,42,0.10)',
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            bgcolor: isDark ? '#111b2b' : '#ffffff',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <ShieldOutlined sx={{ color: '#4f46e5' }} />
                <Chip size="small" color={statusMeta.color} label={statusMeta.label} />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: 0 }}>
                Complete KYC to unlock Single Audio
              </Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary', maxWidth: 680 }}>
                Submit your identity and account details. Your dashboard tools open after admin approval.
              </Typography>
            </Box>
            {status === 'submitted' && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#f59e0b' }}>
                <HourglassTop />
                <Typography fontWeight={700}>Admin review pending</Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: isDark ? '#0f1724' : '#f8fafc' }}>
          {status === 'rejected' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {user?.verification?.rejectionReason || 'Your KYC was rejected. Update your details and resubmit.'}
            </Alert>
          )}
          {status === 'submitted' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Your KYC is submitted. You can update and resubmit details if admin asked for corrections.
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel>Account type</InputLabel>
              <Select label="Account type" value={form.accountType} onChange={(e) => setValue('accountType', e.target.value)}>
                <MenuItem value="artist">Artist</MenuItem>
                <MenuItem value="label">Label</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Phone number" value={form.phoneNumber} onChange={(e) => setValue('phoneNumber', e.target.value)} required />
            {form.accountType === 'artist' ? (
              <>
                <TextField label="Artist name" value={form.artistName} onChange={(e) => setValue('artistName', e.target.value)} required />
                <TextField label="Legal name" value={form.legalName} onChange={(e) => setValue('legalName', e.target.value)} required />
                <FormControl fullWidth>
                  <InputLabel>ID type</InputLabel>
                  <Select label="ID type" value={form.idType} onChange={(e) => setValue('idType', e.target.value)}>
                    <MenuItem value="pan">PAN</MenuItem>
                    <MenuItem value="aadhaar">Aadhaar</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="ID number" value={form.idNumber} onChange={(e) => setValue('idNumber', e.target.value)} required />
                <TextField label="Number of tracks" type="number" value={form.numberOfTracks} onChange={(e) => setValue('numberOfTracks', e.target.value)} />
                <TextField label="Number of releases" type="number" value={form.numberOfReleases} onChange={(e) => setValue('numberOfReleases', e.target.value)} />
              </>
            ) : (
              <>
                <TextField label="Label name" value={form.labelName} onChange={(e) => setValue('labelName', e.target.value)} required />
                <FormControl fullWidth>
                  <InputLabel>Registration type</InputLabel>
                  <Select label="Registration type" value={form.registrationType} onChange={(e) => setValue('registrationType', e.target.value)}>
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="registered_company">Registered company</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Total artists" type="number" value={form.totalArtists} onChange={(e) => setValue('totalArtists', e.target.value)} />
                <TextField label="Catalog size" type="number" value={form.catalogSize} onChange={(e) => setValue('catalogSize', e.target.value)} />
                <TextField label="Total revenue" type="number" value={form.totalRevenue} onChange={(e) => setValue('totalRevenue', e.target.value)} />
                <FormControl fullWidth>
                  <InputLabel>Rights type</InputLabel>
                  <Select label="Rights type" value={form.rightsType} onChange={(e) => setValue('rightsType', e.target.value)}>
                    <MenuItem value="exclusive">Exclusive</MenuItem>
                    <MenuItem value="non_exclusive">Non-exclusive</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            <TextField
              label="Legal address"
              value={form.legalAddress}
              onChange={(e) => setValue('legalAddress', e.target.value)}
              multiline
              minRows={3}
              required
              sx={{ gridColumn: { md: '1 / -1' } }}
            />
            <FormControl fullWidth>
              <InputLabel>Mobile verification API</InputLabel>
              <Select label="Mobile verification API" value={form.mobileVerificationProvider} onChange={(e) => setValue('mobileVerificationProvider', e.target.value)}>
                <MenuItem value="sandbox">Sandbox dummy</MenuItem>
                <MenuItem value="surepass">Surepass dummy</MenuItem>
                <MenuItem value="manual">Manual review</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>KYC API</InputLabel>
              <Select label="KYC API" value={form.kycProvider} onChange={(e) => setValue('kycProvider', e.target.value)}>
                <MenuItem value="sandbox">Sandbox dummy</MenuItem>
                <MenuItem value="surepass">Surepass dummy</MenuItem>
                <MenuItem value="manual">Manual review</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mt: 4 }}>
            <FormControlLabel
              control={<Switch checked={form.kycConsent} onChange={(e) => setValue('kycConsent', e.target.checked)} />}
              label="I consent to mobile and KYC verification."
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} /> : <CheckCircle />}
              sx={{ borderRadius: 2, px: 4, fontWeight: 800 }}
            >
              {submitting ? 'Submitting' : status === 'submitted' ? 'Resubmit KYC' : 'Submit KYC'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
