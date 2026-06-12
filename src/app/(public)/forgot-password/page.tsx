'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';

const authBackground = `
  radial-gradient(ellipse 80% 50% at 80% 20%, rgba(123,31,162,0.18) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 10% 80%, rgba(237,30,121,0.10) 0%, transparent 60%),
  radial-gradient(ellipse 50% 60% at 50% 50%, rgba(83,12,195,0.07) 0%, transparent 70%),
  #05050A
`;

const authButtonGradient = 'linear-gradient(135deg,#ed1e79,#7b1fa2)';

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
    <Box
      sx={{
        minHeight: 'calc(100vh - 96px)',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: authBackground,
        bgcolor: '#05050a',
      }}
    >
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          width: '100%',
          maxWidth: 460,
          p: 4,
          borderRadius: 4,
          bgcolor: 'rgba(17,24,39,0.92)',
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px rgba(2,8,23,0.38)',
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Reset Password</Typography>
          <Typography sx={{ color: 'rgba(226,232,240,0.68)' }}>Enter your account email. We will send a secure reset link.</Typography>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus fullWidth />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: authButtonGradient,
              fontWeight: 800,
              '&:hover': { background: authButtonGradient },
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Button component={Link} href="/login" variant="text" sx={{ color: '#ed1e79' }}>Back to Login</Button>
        </Stack>
      </Box>
    </Box>
  );
}
