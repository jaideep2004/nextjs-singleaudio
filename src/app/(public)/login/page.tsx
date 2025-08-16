'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import GlassCard from '@/components/ui/GlassCard';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <AnimatedBackground />
      {/* Main Content */}
      <Fade in={mounted} timeout={1000}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 0, lg: 8 },
          flexDirection: { xs: 'column', lg: 'row' }
        }}>
          {mounted ? (
            <>
              {/* Left Side - Branding */}
              <Zoom in={mounted} timeout={1200} style={{ transitionDelay: '200ms' }}>
                <Box sx={{ 
                  flex: 1,
                  display: { xs: 'none', lg: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: 'white',
                  mb: { xs: 4, lg: 0 }
                }}>
                  {/* Logo */}
                  <Box sx={{
                    width: 120,
                    height: 120,
                    mb: 4,
                    position: 'relative',
                    borderRadius: '30px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05) rotateY(10deg)'
                    }
                  }}>
                    <Image src="/images/k1.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: 2, background: 'linear-gradient(90deg,#6a82fb,#fc5c7d 60%,#5f2c82)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>
                    Karhari Media
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400, mb: 6 }}>
                    Welcome back! Please login to your account.
                  </Typography>
                </Box>
              </Zoom>
              {/* Right Side - Login Form */}
              <GlassCard>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: { xs: '100%', sm: 400 }, p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', background: 'linear-gradient(90deg,#fc5c7d,#6a82fb 60%,#5f2c82)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Login
                  </Typography>
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    fullWidth
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color={focusedField === 'email' ? 'primary' : 'disabled'} />
                        </InputAdornment>
                      )
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color={focusedField === 'password' ? 'primary' : 'disabled'} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" tabIndex={-1}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForward />}
                    disabled={isLoading}
                    sx={{ mt: 2, fontWeight: 700, fontSize: 18, borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(90, 61, 255, 0.15)', background: 'linear-gradient(90deg,#6a82fb,#fc5c7d 60%,#5f2c82)', color: 'white', transition: 'background 0.3s', '&:hover': { background: 'linear-gradient(90deg,#fc5c7d,#6a82fb 60%,#5f2c82)' } }}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Link href="/forgot-password" style={{ color: '#6a82fb', textDecoration: 'none', fontWeight: 500 }}>Forgot Password?</Link>
                    <Link href="/signup" style={{ color: '#fc5c7d', textDecoration: 'none', fontWeight: 500 }}>Create Account</Link>
                  </Box>
                </Box>
              </GlassCard>
            </>
          ) : (
            <Box sx={{ color: 'white', width: '100%', textAlign: 'center', fontSize: 24 }}>Loading...</Box>
          )}
        </Box>
      </Fade>
    </Box>
  );
}