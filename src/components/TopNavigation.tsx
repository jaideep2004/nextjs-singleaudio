'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  useTheme,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  NotificationsOutlined,
  KeyboardArrowDown,
  DarkMode,
  LightMode,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import { useColorMode } from '@/context/ColorModeContext';

interface TopNavigationProps {
  title?: string;
}

export default function TopNavigation({ title = 'Single Audio' }: TopNavigationProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // FIX: Always call hooks at the top level (never conditionally)
  const auth = useAuth();
  const colorMode = useColorMode();
  const { user, logout } = auth;
  const { toggleColorMode } = colorMode;

  // Menu states
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setIsAdmin(user?.role === 'admin');
    setIsDarkMode(theme.palette.mode === 'dark');
  }, [user, theme.palette.mode]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  // Generate breadcrumb from pathname
  const getBreadcrumb = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return null;
    const breadcrumb = parts.slice(1).map((part) =>
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    );
    return breadcrumb.join(' / ');
  };

  // Don't render anything during SSR to prevent hydration errors
  if (!isClient) {
    return <AppBar position="sticky" elevation={0} color="default"><Toolbar /></AppBar>;
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="default"
      sx={{
        bgcolor: isDarkMode ? 'rgba(9, 14, 26, 0.8)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: '60px !important' }}>
        {/* Left: Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getBreadcrumb() && (
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
                fontWeight: 500,
                fontSize: '0.85rem',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {getBreadcrumb()}
            </Typography>
          )}
        </Box>

        {/* Right: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Search */}
          <Tooltip title="Search">
            <IconButton
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
                },
              }}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton
              onClick={toggleColorMode}
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
                },
              }}
            >
              {isDarkMode ? <LightMode sx={{ fontSize: 19 }} /> : <DarkMode sx={{ fontSize: 19 }} />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              onClick={handleNotificationsOpen}
              sx={{
                width: 36,
                height: 36,
                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
                },
              }}
            >
              <Badge
                badgeContent={3}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 16,
                    minWidth: 16,
                  },
                }}
              >
                <NotificationsOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={handleNotificationsClose}
            PaperProps={{
              sx: {
                width: 340,
                maxHeight: 420,
                mt: 1,
                borderRadius: '14px',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                bgcolor: isDarkMode ? '#111827' : '#ffffff',
                boxShadow: isDarkMode
                  ? '0 12px 40px rgba(0,0,0,0.4)'
                  : '0 12px 40px rgba(15,23,42,0.1)',
              },
            }}
          >
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
            </Box>
            <Divider sx={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }} />
            <MenuItem onClick={handleNotificationsClose} sx={{ px: 2.5, py: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>New track approved</Typography>
                <Typography variant="caption" color="text.secondary">
                  Your track &quot;Summer Vibes&quot; has been approved
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose} sx={{ px: 2.5, py: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>Royalty payment received</Typography>
                <Typography variant="caption" color="text.secondary">
                  You received $24.50 in royalties
                </Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* Separator */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              mx: 0.5,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
              height: 24,
              alignSelf: 'center',
            }}
          />

          {/* User menu */}
          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              py: 0.5,
              px: 1,
              borderRadius: '10px',
              transition: 'background 150ms ease',
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: isDarkMode ? '#1e293b' : '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: isDarkMode ? '#94a3b8' : '#475569',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  lineHeight: 1.2,
                  color: isDarkMode ? '#e2e8f0' : '#1e293b',
                }}
              >
                {user?.name || 'User'}
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ fontSize: 16, color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
          </Box>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                bgcolor: isDarkMode ? '#111827' : '#ffffff',
                boxShadow: isDarkMode
                  ? '0 8px 24px rgba(0,0,0,0.3)'
                  : '0 8px 24px rgba(15,23,42,0.08)',
                minWidth: 180,
              },
            }}
          >
            <MenuItem
              component={Link}
              href={isAdmin ? '/admin/settings' : '/settings/profile'}
              onClick={handleUserMenuClose}
              sx={{ py: 1.25, fontSize: '0.875rem' }}
            >
              Profile
            </MenuItem>
            <Divider sx={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }} />
            <MenuItem onClick={logout} sx={{ py: 1.25, fontSize: '0.875rem', color: '#ef4444' }}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}