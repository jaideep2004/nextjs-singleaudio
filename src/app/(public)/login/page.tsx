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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
  MusicNote,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      // minHeight: '100vh', 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' 
        : 'linear-gradient(135deg, #f5f7fa 0%, #e4edf9 50%, #d6e4f7 100%)'
    }} style={{ maxWidth: '1400px !important', width: '100%' }}>
      {/* <AnimatedBackground /> */}
      
      {/* Floating Music Notes */}
      <Box sx={{ position: 'absolute', top: '10%', left: '10%', zIndex: 0 }}>
        <Box
          sx={{
            animation: 'float1 4s ease-in-out infinite',
          }}
        >
          <MusicNote sx={{ 
            fontSize: 40, 
            color: theme.palette.mode === 'dark' ? 'rgba(106, 130, 251, 0.3)' : 'rgba(74, 108, 247, 0.3)',
            opacity: 0.7
          }} />
        </Box>
      </Box>
      
      <Box sx={{ position: 'absolute', top: '20%', right: '15%', zIndex: 0 }}>
        <Box
          sx={{
            animation: 'float2 3.5s ease-in-out infinite',
          }}
        >
          <MusicNote sx={{ 
            fontSize: 30, 
            color: theme.palette.mode === 'dark' ? 'rgba(252, 92, 125, 0.3)' : 'rgba(245, 166, 35, 0.3)',
            opacity: 0.7
          }} />
        </Box>
      </Box>
      
      <Box sx={{ position: 'absolute', bottom: '15%', left: '15%', zIndex: 0 }}>
        <Box
          sx={{
            animation: 'float3 4.5s ease-in-out infinite',
          }}
        >
          <MusicNote sx={{ 
            fontSize: 35, 
            color: theme.palette.mode === 'dark' ? 'rgba(95, 44, 130, 0.3)' : 'rgba(212, 140, 26, 0.3)',
            opacity: 0.7
          }} />
        </Box>
      </Box>

      {/* Main Content */}
      <Fade in={mounted} timeout={1000} style={{ maxWidth: '1400px !important', width: '100%' }}>
        <Box sx={{ 
          width: '100%',
         
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 0, lg: 8 },
          flexDirection: { xs: 'column', lg: 'row' },
          zIndex: 1
        }}  
        style={{ maxWidth: '1400px !important', width: '100%' }}
        >
          {mounted ? (
            <>
              {/* Left Side - Branding */}
              <Box sx={{ 
                flex: 1,
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)',
                mb: { xs: 4, lg: 0 },
                pl: { lg: 4 },
                opacity: 0,
                animation: 'fadeInLeft 0.7s ease-out forwards'
              }}>
                <Box sx={{ 
                  opacity: 0,
                  animation: 'fadeInUp 0.5s ease-out 0.2s forwards'
                }}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 2,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 60%, #5f2c82 100%)'
                        : 'linear-gradient(90deg, #4a6cf7 0%, #f5a623 60%, #d48c1a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { lg: '3.5rem', xl: '4rem' }
                    }}
                  >
                    Karhari Media
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  opacity: 0,
                  animation: 'fadeInUp 0.5s ease-out 0.4s forwards'
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 4,
                      maxWidth: '80%',
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
                    }}
                  >
                    Professional Music Distribution Platform
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  opacity: 0,
                  animation: 'fadeInUp 0.5s ease-out 0.6s forwards'
                }}>
                  <Box sx={{
                    display: 'flex',
                    gap: 3,
                    mt: 4
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(106, 130, 251, 0.2)' 
                          : 'rgba(74, 108, 247, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <MusicNote sx={{ 
                          color: theme.palette.mode === 'dark' ? '#6a82fb' : '#4a6cf7',
                          fontSize: 30
                        }} />
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                      }}>
                        Distribute
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(252, 92, 125, 0.2)' 
                          : 'rgba(245, 166, 35, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <MusicNote sx={{ 
                          color: theme.palette.mode === 'dark' ? '#fc5c7d' : '#f5a623',
                          fontSize: 30
                        }} />
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                      }}>
                        Monetize
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(95, 44, 130, 0.2)' 
                          : 'rgba(212, 140, 26, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <MusicNote sx={{ 
                          color: theme.palette.mode === 'dark' ? '#5f2c82' : '#d48c1a',
                          fontSize: 30
                        }} />
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                      }}>
                        Grow
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Right Side - Login Form */}
              <Box sx={{ 
                width: '100%',
                opacity: 0,
                animation: 'fadeInRight 0.7s ease-out 0.2s forwards'
              }}>
                <Box sx={{
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(26, 26, 46, 0.7)' 
                    : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                  borderRadius: '20px',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' 
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  width: { xs: '100%', sm: 450 },
                  maxWidth: '100%',
                  margin: '0 auto',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
                  }
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(106, 130, 251, 0.1) 0%, transparent 100%)'
                      : 'linear-gradient(135deg, rgba(74, 108, 247, 0.05) 0%, transparent 100%)',
                    clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)'
                  }} />
                  
                  <Box component="form" onSubmit={handleSubmit} sx={{ 
                    width: '100%', 
                    p: { xs: 3, sm: 5 }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3,
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <Box sx={{ 
                      opacity: 0,
                      animation: 'fadeInUp 0.5s ease-out forwards'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2 
                      }}>
                        <Box sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '24px',
                          background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, rgba(106, 130, 251, 0.2) 0%, rgba(95, 44, 130, 0.2) 100%)'
                            : 'linear-gradient(135deg, rgba(74, 108, 247, 0.1) 0%, rgba(212, 140, 26, 0.1) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: theme.palette.mode === 'dark' 
                              ? 'conic-gradient(transparent, rgba(106, 130, 251, 0.5), transparent 70%)'
                              : 'conic-gradient(transparent, rgba(74, 108, 247, 0.3), transparent 70%)',
                            animation: 'rotate 3s linear infinite'
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: '4px',
                            borderRadius: '20px',
                            background: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
                            zIndex: 1
                          }
                        }}>
                          <Box sx={{
                            position: 'relative',
                            zIndex: 2,
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <MusicNote sx={{ 
                              color: theme.palette.mode === 'dark' ? '#6a82fb' : '#4a6cf7',
                              fontSize: 30
                            }} />
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          mb: 1, 
                          textAlign: 'center',
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 60%, #5f2c82 100%)'
                            : 'linear-gradient(90deg, #4a6cf7 0%, #f5a623 60%, #d48c1a 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        Welcome Back
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          textAlign: 'center', 
                          mb: 4,
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        Sign in to continue your journey
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      opacity: 0,
                      animation: 'fadeInUp 0.5s ease-out 0.2s forwards'
                    }}>
                      {error && (
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 2,
                            borderRadius: '12px',
                            background: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 55, 55, 0.15)' 
                              : 'rgba(255, 55, 55, 0.05)',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 55, 55, 0.3)' : 'rgba(255, 55, 55, 0.1)'}`
                          }}
                        >
                          {error}
                        </Alert>
                      )}
                      
                      <TextField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                        autoFocus
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email 
                                sx={{ 
                                  color: focusedField === 'email' 
                                    ? theme.palette.primary.main 
                                    : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
                                }} 
                              />
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '12px',
                            background: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.02)',
                            '&:hover': {
                              background: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.04)'
                            },
                            '&.Mui-focused': {
                              background: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.04)'
                            }
                          }
                        }}
                        sx={{
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.3)' 
                                : 'rgba(0, 0, 0, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          }
                        }}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      opacity: 0,
                      animation: 'fadeInUp 0.5s ease-out 0.4s forwards'
                    }}>
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
                              <Lock 
                                sx={{ 
                                  color: focusedField === 'password' 
                                    ? theme.palette.primary.main 
                                    : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
                                }} 
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                onClick={() => setShowPassword(!showPassword)} 
                                edge="end" 
                                tabIndex={-1}
                                sx={{
                                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '12px',
                            background: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.02)',
                            '&:hover': {
                              background: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.04)'
                            },
                            '&.Mui-focused': {
                              background: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.04)'
                            }
                          }
                        }}
                        sx={{
                          mb: 1,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.3)' 
                                : 'rgba(0, 0, 0, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          }
                        }}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      opacity: 0,
                      animation: 'fadeInUp 0.5s ease-out 0.6s forwards'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Link 
                          href="/forgot-password" 
                          style={{ 
                            color: theme.palette.mode === 'dark' ? '#6a82fb' : '#4a6cf7', 
                            textDecoration: 'none', 
                            fontWeight: 500,
                            fontSize: '0.9rem'
                          }}
                        >
                          Forgot Password?
                        </Link>
                      </Box>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        endIcon={<ArrowForward />}
                        disabled={isLoading}
                        sx={{ 
                          mt: 1, 
                          mb: 3,
                          py: 1.5,
                          fontWeight: 700, 
                          fontSize: '1.1rem',
                          borderRadius: '12px',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 4px 20px 0 rgba(106, 130, 251, 0.3)' 
                            : '0 4px 20px 0 rgba(74, 108, 247, 0.2)',
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 60%, #5f2c82 100%)'
                            : 'linear-gradient(90deg, #4a6cf7 0%, #f5a623 60%, #d48c1a 100%)',
                          color: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.palette.mode === 'dark' 
                              ? '0 6px 25px 0 rgba(106, 130, 251, 0.5)' 
                              : '0 6px 25px 0 rgba(74, 108, 247, 0.3)',
                            background: theme.palette.mode === 'dark'
                              ? 'linear-gradient(90deg, #7b93fc 0%, #fd6d8e 60%, #6f3d93 100%)'
                              : 'linear-gradient(90deg, #5b7df8 0%, #f6b74f 60%, #e59d2c 100%)'
                          },
                          '&:disabled': {
                            background: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'rgba(0, 0, 0, 0.05)',
                            color: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.5)' 
                              : 'rgba(0, 0, 0, 0.5)',
                            transform: 'none',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          Don't have an account?
                        </Typography>
                        <Link 
                          href="/signup" 
                          style={{ 
                            color: theme.palette.mode === 'dark' ? '#fc5c7d' : '#f5a623', 
                            textDecoration: 'none', 
                            fontWeight: 600
                          }}
                        >
                          Sign Up
                        </Link>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)', 
              width: '100%', 
              textAlign: 'center', 
              fontSize: 24 
            }}>
              Loading...
            </Box>
          )}
        </Box>
      </Fade>
      
      <style jsx global>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float1 {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes float2 {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-10deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes float3 {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(15deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}