'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
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
  Dashboard as DashboardIcon,
  MusicNote,
  Payments,
  Settings,
  Person,
  NotificationsOutlined,
  Menu as MenuIcon,
  KeyboardArrowDown,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import { useColorMode } from '@/context/ColorModeContext';

interface TopNavigationProps {
  title?: string;
}

export default function TopNavigation({ title = 'Karhari Media' }: TopNavigationProps) {
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setIsAdmin(user?.role === 'admin');
    setIsDarkMode(theme.palette.mode === 'dark');
  }, [user, theme.palette.mode]);

  // Handle menu open/close
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  // Navigation items based on user role
  // Unified navItems: show admin-specific options if isAdmin, else artist options
  const navItems = isAdmin
    ? [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { label: 'Users', path: '/admin/users', icon: <Person /> },
        { label: 'Tracks', path: '/admin/tracks', icon: <MusicNote /> },
        { label: 'Payouts', path: '/admin/payouts', icon: <Payments /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings /> },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'Upload', path: '/dashboard/upload', icon: <MusicNote /> },
        { label: 'Royalties', path: '/dashboard/royalties', icon: <Payments /> },
        { label: 'Settings', path: '/dashboard/settings', icon: <Settings /> },
      ];

  // The dark/light mode toggle is already present in the topbar for all users.

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Don't render anything during SSR to prevent hydration errors
  if (!isClient) {
    return <AppBar position="sticky" elevation={1} color="default"><Toolbar /></AppBar>;
  }

  return (
    <AppBar position="sticky" elevation={1} color="default">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo and brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component={Link}
            href={isAdmin ? '/admin/dashboard' : '/dashboard'}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              mr: 2,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {title}
          </Typography>

          {/* Mobile menu */}
          <IconButton
            color="inherit"
            aria-label="menu"
            edge="start"
            onClick={handleMenuOpen}
            sx={{ mr: 1, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ display: { sm: 'none' } }}
          >
            {navItems.map((item) => (
              <MenuItem
                key={item.path}
                component={Link}
                href={item.path}
                onClick={handleMenuClose}
                selected={isActive(item.path)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                  <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                href={item.path}
                color={isActive(item.path) ? 'primary' : 'inherit'}
                startIcon={item.icon}
                sx={{
                  mx: 0.5,
                  fontWeight: isActive(item.path) ? 600 : 400,
                  borderBottom: isActive(item.path) ? `2px solid ${theme.palette.primary.main}` : 'none',
                  borderRadius: 0,
                  paddingBottom: 1,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Right side - notifications, theme toggle, user menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Theme toggle */}
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={3} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={handleNotificationsClose}
            PaperProps={{
              sx: { width: 320, maxHeight: 450 },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleNotificationsClose}>
              <Box>
                <Typography variant="subtitle2">New track approved</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your track "Summer Vibes" has been approved
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Box>
                <Typography variant="subtitle2">Royalty payment received</Typography>
                <Typography variant="body2" color="text.secondary">
                  You received $24.50 in royalties
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Button size="small">View All</Button>
            </Box>
          </Menu>

          {/* User menu */}
          <Box sx={{ ml: 2 }}>
            <Button
              onClick={handleUserMenuOpen}
              color="inherit"
              endIcon={<KeyboardArrowDown />}
              startIcon={
                <Avatar
                  sx={{ width: 30, height: 30 }}
                  alt={user?.name || 'User'}
                  src="/avatar-placeholder.png"
                />
              }
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name || 'User'}
              </Box>
            </Button>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
            >
              <MenuItem component={Link} href={isAdmin ? '/admin/settings' : '/settings/profile'}>
                Profile
              </MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 