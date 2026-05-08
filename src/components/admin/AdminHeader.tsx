'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  DarkMode,
  LightMode,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNotifications } from '@/context/NotificationsContext';
import { useColorMode } from '@/context/ColorModeContext';

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { unreadCount } = useNotifications();
  const { mode, toggleColorMode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isDark = mode === 'dark';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
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

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        bgcolor: isDark ? 'rgba(9, 14, 26, 0.8)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: '60px !important' }}>
        {/* Left: Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {getBreadcrumb() && (
            <Typography
              variant="body2"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
                fontWeight: 500,
                fontSize: '0.85rem',
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
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
              }}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <IconButton
              onClick={toggleColorMode}
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
              }}
            >
              {isDark ? <LightMode sx={{ fontSize: 19 }} /> : <DarkMode sx={{ fontSize: 19 }} />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 16,
                    minWidth: 16,
                  },
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Separator */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              mx: 0.5,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
              height: 24,
              alignSelf: 'center',
            }}
          />

          {/* User menu */}
          <Box
            onClick={handleClick}
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
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: isDark ? '#7f1d1d' : '#fecaca',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: isDark ? '#fca5a5' : '#dc2626',
              }}
            >
              A
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.82rem',
                color: isDark ? '#e2e8f0' : '#1e293b',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Admin
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
            bgcolor: isDark ? '#111827' : '#ffffff',
            boxShadow: isDark
              ? '0 8px 24px rgba(0,0,0,0.3)'
              : '0 8px 24px rgba(15,23,42,0.08)',
            minWidth: 180,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => router.push('/admin/profile')} sx={{ py: 1.25 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/settings')} sx={{ py: 1.25 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1.25, color: '#ef4444' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}