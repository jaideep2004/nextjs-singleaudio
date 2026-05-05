'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  useTheme
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Logout as LogoutIcon, 
  Settings as SettingsIcon, 
  Person as PersonIcon,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useNotifications } from '@/context/NotificationsContext';
import { useColorMode } from '@/context/ColorModeContext';

export default function AdminHeader() {
  const router = useRouter();
  const theme = useTheme();
  const { unreadCount } = useNotifications();
  const { mode, toggleColorMode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, minHeight: 64 }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #4a6cf7 30%, #6b8af8 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Karhari Media
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit" 
            aria-label="toggle theme"
            onClick={toggleColorMode}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          
          <IconButton 
            color="inherit" 
            aria-label="notifications"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <Avatar sx={{ width: 36, height: 36 }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
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
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => router.push('/admin/profile')}>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}