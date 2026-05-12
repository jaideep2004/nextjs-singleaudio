'use client';

import { useEffect, useMemo, useState } from 'react';
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
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Badge, Mail, Person, Save, Shield } from '@mui/icons-material';
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

export default function ProfilePage({ audience }: ProfilePageProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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

  return (
    <Box sx={{ width: '100%' }}>
      <PremiumHeader
        eyebrow="Account"
        title="Profile"
        description={
          audience === 'admin'
            ? 'Manage your administrator identity and account details.'
            : 'Manage your public artist identity and account details.'
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '0.75fr 1.35fr' },
          gap: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            ...premiumSurfaceSx(theme),
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            alignSelf: 'start',
          }}
        >
          <Stack spacing={2.25} alignItems="center" textAlign="center">
            <Avatar
              sx={{
                width: 76,
                height: 76,
                fontSize: 28,
                fontWeight: 900,
                bgcolor: audience === 'admin' ? '#ef4444' : '#4a6cf7',
              }}
            >
              {initials || 'SA'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                {displayName || user?.email || 'Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'No email available'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip icon={<Shield />} label={roleLabel(user?.role)} size="small" />
              {user?.accountType && <Chip icon={<Badge />} label={roleLabel(user.accountType)} size="small" variant="outlined" />}
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            ...premiumSurfaceSx(theme),
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Profile Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep visible account information current.
              </Typography>
            </Box>
            <Divider />

            <TextField
              label="Display Name"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              fullWidth
              autoComplete="name"
              InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />

            {audience === 'dashboard' && (
              <TextField
                label="Artist Name"
                value={artistName}
                onChange={event => setArtistName(event.target.value)}
                fullWidth
                autoComplete="organization-title"
              />
            )}

            <TextField
              label="Email"
              value={user?.email || ''}
              fullWidth
              disabled
              helperText="Email changes require admin support."
              InputProps={{ startAdornment: <Mail sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />

            <TextField label="Role" value={roleLabel(user?.role)} fullWidth disabled />

            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
