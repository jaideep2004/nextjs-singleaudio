'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { AccountBalance, Badge, Business, LockOutlined, Mail, Person, Save, Shield } from '@mui/icons-material';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';
import { useAuth } from '@/context/AppContext';

interface ProfilePageProps {
  audience: 'admin' | 'dashboard';
}

const roleLabel = (role?: string) => {
  if (!role) return 'User';
  return role
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const displayValue = (value: unknown) => {
  if (value === undefined || value === null || String(value).trim() === '') return '-';
  return String(value);
};

const DetailGrid = ({ items }: { items: Array<[string, unknown]> }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
    {items.map(([label, value]) => (
      <Box key={label} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
          {displayValue(value)}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default function ProfilePage({ audience }: ProfilePageProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const onboarding = user?.onboarding || {};
  const payoutMethod = user?.payoutMethod || onboarding?.payoutMethod;
  const payoutDetails = payoutMethod?.details || {};
  const isLabel = user?.accountType === 'label' || user?.role === 'label';

  const initials = useMemo(() => {
    const source = displayName || artistName || user?.email || 'SA';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');
  }, [artistName, displayName, user?.email]);

  useEffect(() => {
    setDisplayName(user?.name || '');
    setArtistName(user?.artistName || '');
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess('');
      setError('');
      await axios.put('/auth/me', {
        name: displayName.trim(),
        ...(audience === 'dashboard' ? { artistName: artistName.trim() } : {}),
      });
      setSuccess('Profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { label: 'User Info', icon: <Person fontSize="small" /> },
    ...(audience === 'dashboard' && isLabel ? [{ label: 'Company Info', icon: <Business fontSize="small" /> }] : []),
    ...(audience === 'dashboard' ? [{ label: 'Bank Details', icon: <AccountBalance fontSize="small" /> }] : []),
  ];

  const companyTabIndex = audience === 'dashboard' && isLabel ? 1 : -1;
  const bankTabIndex = audience === 'dashboard' ? tabs.length - 1 : -1;

  return (
    <Box sx={{ width: '100%' }}>
      <PremiumHeader
        eyebrow="Account"
        title="Profile"
        description={
          audience === 'admin'
            ? 'Manage administrator identity and account details.'
            : 'Manage profile, company, and payout readiness.'
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.75fr 1.35fr' }, gap: 3 }}>
        <Paper elevation={0} sx={{ ...premiumSurfaceSx(theme), p: { xs: 2.5, md: 3 }, borderRadius: 3, alignSelf: 'start' }}>
          <Stack spacing={2.25} alignItems="center" textAlign="center">
            <Avatar sx={{ width: 76, height: 76, fontSize: 28, fontWeight: 900, bgcolor: audience === 'admin' ? '#ef4444' : '#4a6cf7' }}>
              {initials || 'SA'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={900}>{displayName || user?.email || 'Profile'}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email || 'No email available'}</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip icon={<Shield />} label={roleLabel(user?.role)} size="small" />
              {user?.accountType && <Chip icon={<Badge />} label={roleLabel(user.accountType)} size="small" variant="outlined" />}
              {user?.verification?.status && <Chip label={`KYC ${user.verification.status}`} size="small" color={user.verification.status === 'approved' ? 'success' : user.verification.status === 'rejected' ? 'error' : 'warning'} />}
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ ...premiumSurfaceSx(theme), borderRadius: 3, overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ px: 1, pt: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            {tabs.map((item, index) => (
              <Tab key={item.label} icon={item.icon} iconPosition="start" label={item.label} value={index} sx={{ textTransform: 'none', fontWeight: 850, minHeight: 54 }} />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            {tab === 0 && (
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>User Info</Typography>
                  <Typography variant="body2" color="text.secondary">Keep visible account information current.</Typography>
                </Box>
                <Divider />
                {audience === 'admin' && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Admin login email is changed from User Management. Open the admin user record and edit Email Address.
                  </Alert>
                )}
                <TextField
                  label="Display Name"
                  value={displayName}
                  onChange={event => setDisplayName(event.target.value)}
                  fullWidth
                  autoComplete="name"
                  InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
                {audience === 'dashboard' && (
                  <TextField label={isLabel ? 'Representative / Public Name' : 'Artist Name'} value={artistName} onChange={event => setArtistName(event.target.value)} fullWidth autoComplete="organization-title" />
                )}
                <TextField label="Email" value={user?.email || ''} fullWidth disabled helperText="Email changes require admin support." InputProps={{ startAdornment: <Mail sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                <TextField label="Role" value={roleLabel(user?.role)} fullWidth disabled />
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave} disabled={saving || !displayName.trim()}>
                    {saving ? 'Saving…' : 'Save Profile'}
                  </Button>
                  {audience === 'admin' && (
                    <Button component={Link} href="/admin/users" variant="outlined">Open User Management</Button>
                  )}
                </Stack>
              </Stack>
            )}

            {tab === companyTabIndex && (
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Company Info</Typography>
                  <Typography variant="body2" color="text.secondary">Label and company details from KYC onboarding.</Typography>
                </Box>
                <Divider />
                <DetailGrid
                  items={[
                    ['Label Name', onboarding.labelName || user?.artistName],
                    ['Representative Name', onboarding.legalName || user?.name],
                    ['Registration Type', onboarding.registrationType],
                    ['Legal Entity Name', onboarding.legalEntityName],
                    ['Company Type', onboarding.companyType],
                    ['Total Artists', onboarding.totalArtists],
                    ['Catalog Size', onboarding.catalogSize],
                    ['Rights Type', onboarding.rightsType],
                    ['Website', onboarding.companyWebsite],
                    ['Address', onboarding.location?.address || onboarding.legalAddress],
                  ]}
                />
              </Stack>
            )}

            {tab === bankTabIndex && (
              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={900}>Bank Details</Typography>
                    {payoutMethod?.method && <Chip icon={<LockOutlined />} label="Locked" size="small" color="info" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Saved payout details are read-only. Contact admin to change payout method or bank details.
                  </Typography>
                </Box>
                <Divider />
                <DetailGrid
                  items={[
                    ['Method', payoutMethod?.method ? roleLabel(payoutMethod.method) : 'Not saved'],
                    ['Account Holder', payoutDetails.accountHolderName],
                    ['Account Number', payoutDetails.accountNumber],
                    ['IFSC', payoutDetails.ifscCode],
                    ['Bank', payoutDetails.bankName],
                    ['Branch', payoutDetails.branch || payoutDetails.branchName],
                    ['PayPal Email', payoutDetails.paypalEmail],
                    ['Updated', payoutMethod?.updatedAt ? new Date(payoutMethod.updatedAt).toLocaleString() : undefined],
                  ]}
                />
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
