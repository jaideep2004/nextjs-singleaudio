'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to send reset link');
      setMessage(payload.message || 'Reset instructions sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 96px)', display: 'grid', placeItems: 'center', px: 2 }}>
      <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 6 }}>
        <Stack spacing={2.5}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Reset Password</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Enter your account email. We will send a secure reset link.</Typography>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus fullWidth />
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
          <Button component={Link} href="/login" variant="text">Back to Login</Button>
        </Stack>
      </Box>
    </Box>
  );
}
