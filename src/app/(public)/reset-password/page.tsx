'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: searchParams.get('email'),
          token: searchParams.get('token'),
          password,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to reset password');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 96px)', display: 'grid', placeItems: 'center', px: 2 }}>
      <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 6 }}>
        <Stack spacing={2.5}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Create New Password</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus fullWidth />
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Save Password'}</Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
