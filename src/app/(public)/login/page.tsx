'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowForward,
  Email,
  GraphicEq,
  Insights,
  Lock,
  Public,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';

const trustPoints = [
  'Release music with a cleaner artist workflow',
  'Review performance and royalty activity in one place',
  'Manage catalog, payouts, and approvals professionally',
];

const featureCards = [
  {
    icon: <Public sx={{ fontSize: 20 }} />,
    title: 'Global Reach',
    text: 'Organize releases for a distribution-ready catalog experience.',
  },
  {
    icon: <Insights sx={{ fontSize: 20 }} />,
    title: 'Artist Insights',
    text: 'Track momentum, payouts, and release activity from one dashboard.',
  },
  {
    icon: <GraphicEq sx={{ fontSize: 20 }} />,
    title: 'Catalog Control',
    text: 'Keep audio, artwork, and metadata under one operational flow.',
  },
];

const authBackground = `
  radial-gradient(ellipse 80% 50% at 80% 20%, rgba(123,31,162,0.18) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 10% 80%, rgba(237,30,121,0.10) 0%, transparent 60%),
  radial-gradient(ellipse 50% 60% at 50% 50%, rgba(83,12,195,0.07) 0%, transparent 70%),
  #05050A
`;

const authButtonGradient = 'linear-gradient(135deg,#ed1e79,#7b1fa2)';

export default function LoginPage() {
  const { login } = useAuth();
  const theme = useTheme();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        ml: 'calc(50% - 50vw)',
        mr: 'calc(50% - 50vw)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 96px)',
        px: { xs: 2, sm: 3, md: 5, lg: 6 },
        py: { xs: 3, md: 6 },
        background: authBackground,
        bgcolor: '#05050a',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'transparent',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: { xs: 72, md: 120 },
          right: { xs: -80, md: 40 },
          width: { xs: 220, md: 360 },
          height: { xs: 220, md: 360 },
          borderRadius: '50%',
          border: `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
          }`,
          opacity: 0.6,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: -40, md: 10 },
          left: { xs: -90, md: 30 },
          width: { xs: 180, md: 280 },
          height: { xs: 180, md: 280 },
          borderRadius: '36px',
          transform: 'rotate(24deg)',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.2))',
          border: `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'
          }`,
        }}
      />

      <Box
        sx={{
          maxWidth: 1360,
          mx: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.15fr minmax(420px, 530px)' },
            gap: { xs: 3, md: 4, lg: 5 },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              borderRadius: { xs: '28px', md: '36px' },
              p: { xs: 3, sm: 4, md: 5 },
              minHeight: { xs: 'auto', lg: 720 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#f8fafc',
              position: 'relative',
              overflow: 'hidden',
              background:
                'linear-gradient(150deg, rgba(7, 19, 39, 0.92) 0%, rgba(13, 28, 51, 0.88) 54%, rgba(20, 48, 76, 0.92) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 28px 80px rgba(3, 10, 24, 0.34)',
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 600ms ease, transform 600ms ease',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at top right, rgba(89, 153, 255, 0.22), transparent 22%), radial-gradient(circle at bottom left, rgba(255, 168, 106, 0.18), transparent 18%)',
              }}
            />

            <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Chip
                label="Single Audio"
                sx={{
                  alignSelf: 'flex-start',
                  height: 34,
                  px: 1,
                  color: '#dbeafe',
                  bgcolor: 'rgba(148, 163, 184, 0.12)',
                  border: '1px solid rgba(191, 219, 254, 0.14)',
                  fontWeight: 700,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.5rem' },
                    lineHeight: 1.02,
                    fontWeight: 800,
                    maxWidth: 720,
                    letterSpacing: 0,
                  }}
                >
                  Enter your private music operations suite.
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    maxWidth: 640,
                    fontSize: { xs: '1rem', md: '1.08rem' },
                    lineHeight: 1.7,
                    color: 'rgba(226, 232, 240, 0.76)',
                  }}
                >
                  Manage releases, artist workflows, royalties, and approvals inside a
                  refined command space built for serious catalog teams.
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                {trustPoints.map((point) => (
                  <Box
                    key={point}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      color: 'rgba(248, 250, 252, 0.92)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#7dd3fc',
                        boxShadow: '0 0 0 6px rgba(125, 211, 252, 0.12)',
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: { xs: '0.98rem', md: '1.02rem' } }}>
                      {point}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 4, md: 6 } }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {featureCards.map((card) => (
                  <Box
                    key={card.title}
                    sx={{
                      p: 2.5,
                      borderRadius: '24px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '14px',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(125, 211, 252, 0.14)',
                        color: '#93c5fd',
                        mb: 1.5,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.75 }}>{card.title}</Typography>
                    <Typography sx={{ color: 'rgba(226, 232, 240, 0.7)', lineHeight: 1.65 }}>
                      {card.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                borderRadius: { xs: '28px', md: '32px' },
                p: { xs: 3, sm: 4, md: 5 },
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(180deg, rgba(17, 24, 39, 0.92), rgba(15, 23, 42, 0.85))'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,252,255,0.92))',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(15, 23, 42, 0.08)'
                }`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 24px 60px rgba(2, 8, 23, 0.38)'
                    : '0 24px 60px rgba(15, 23, 42, 0.10)',
                backdropFilter: 'blur(18px)',
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 700ms ease 120ms, transform 700ms ease 120ms',
              }}
            >
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3.25}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.85rem', sm: '2.2rem' },
                        lineHeight: 1.1,
                        fontWeight: 800,
                        color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        letterSpacing: 0,
                      }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography
                      sx={{
                        mt: 1.25,
                        color:
                          theme.palette.mode === 'dark'
                            ? 'rgba(226, 232, 240, 0.72)'
                            : 'rgba(15, 23, 42, 0.62)',
                        lineHeight: 1.7,
                      }}
                    >
                      Sign in to continue managing catalog, payouts, and release pipeline with a secure premium workspace.
                    </Typography>
                  </Box>

                  {error ? (
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: '16px',
                        alignItems: 'center',
                      }}
                    >
                      {error}
                    </Alert>
                  ) : null}

                  <Stack spacing={2}>
                    <TextField
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      fullWidth
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: 60,
                          borderRadius: '18px',
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.03)'
                              : 'rgba(248, 250, 252, 0.96)',
                        },
                      }}
                    />

                    <TextField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                              tabIndex={-1}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: 60,
                          borderRadius: '18px',
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.03)'
                              : 'rgba(248, 250, 252, 0.96)',
                        },
                      }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          theme.palette.mode === 'dark'
                            ? 'rgba(226, 232, 240, 0.64)'
                            : 'rgba(15, 23, 42, 0.56)',
                        fontSize: '0.95rem',
                      }}
                    >
                      Secure access for artists and admins
                    </Typography>
                    <Link href="/forgot-password" style={{ color: theme.palette.primary.main }}>
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    endIcon={<ArrowForward />}
                    sx={{
                      minHeight: 58,
                      borderRadius: '18px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: '0 18px 34px rgba(237,30,121,0.24)',
                      background: authButtonGradient,
                      '&:hover': {
                        background: authButtonGradient,
                        boxShadow: '0 22px 38px rgba(123,31,162,0.32)',
                      },
                    }}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>

                  <Divider />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          theme.palette.mode === 'dark'
                            ? 'rgba(226, 232, 240, 0.72)'
                            : 'rgba(15, 23, 42, 0.62)',
                      }}
                    >
                      Need an account?
                    </Typography>
                    <Link href="/signup" style={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                      Create one
                    </Link>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
