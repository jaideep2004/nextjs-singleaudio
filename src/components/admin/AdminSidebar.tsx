'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Album,
  TrendingUp,
  AccountBalance
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin/dashboard',
  },
  {
    text: 'Users',
    icon: <PeopleIcon />,
    path: '/admin/users',
  },
  {
    text: 'Releases',
    icon: <Album />,
    path: '/admin/releases',
    subItems: [
      { text: 'All Releases', path: '/admin/releases' },
      { text: 'Pending', path: '/admin/releases?status=pending' },
      { text: 'Approved', path: '/admin/releases?status=approved' },
      { text: 'Rejected', path: '/admin/releases?status=rejected' },
    ],
  },
  {
    text: 'Tracks',
    icon: <MusicNoteIcon />,
    path: '/admin/tracks',
  },
  {
    text: 'Payouts',
    icon: <PaymentIcon />,
    path: '/admin/payouts',
  },
  {
    text: 'Analytics',
    icon: <TrendingUp />,
    path: '/admin/analytics',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/admin/settings',
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubMenuClick = (item: string) => {
    setOpenSubMenu(openSubMenu === item ? null : item);
  };

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const drawer = (
    <Box 
      sx={{ 
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(26, 26, 46, 0.8)' : 'rgba(245, 245, 245, 0.8)',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          Admin Panel
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle} 
          sx={{ 
            display: { sm: 'none' },
            color: theme.palette.mode === 'dark' ? 'white' : 'black'
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />
      <List sx={{ px: 1, py: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <div key={item.path}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() =>
                  item.subItems
                    ? handleSubMenuClick(item.path)
                    : router.push(item.path)
                }
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  py: 1.2,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(74, 108, 247, 0.15)' 
                      : 'rgba(74, 108, 247, 0.1)',
                    color: theme.palette.mode === 'dark' ? '#9bafff' : '#4a6cf7',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(74, 108, 247, 0.2)' 
                        : 'rgba(74, 108, 247, 0.15)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.mode === 'dark' ? '#9bafff' : '#4a6cf7',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}
                />
                {item.subItems && (
                  <>{openSubMenu === item.path ? <ExpandLess /> : <ExpandMore />}</>
                )}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse in={openSubMenu === item.path} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ py: 0.5 }}>
                  {item.subItems.map((subItem) => (
                    <ListItemButton
                      key={subItem.path}
                      selected={pathname === subItem.path}
                      onClick={() => router.push(subItem.path)}
                      sx={{
                        borderRadius: 2,
                        mx: 2,
                        py: 1,
                        pl: 3,
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(74, 108, 247, 0.1)' 
                            : 'rgba(74, 108, 247, 0.05)',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(74, 108, 247, 0.15)' 
                              : 'rgba(74, 108, 247, 0.1)',
                          },
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.04)' 
                            : 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <ListItemText 
                        primary={subItem.text} 
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>
      
      {/* Sidebar Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            fontSize: '0.7rem'
          }}
        >
          Karhari Media Admin v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              backgroundColor: 'transparent',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              backgroundColor: 'transparent',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Mobile menu button */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            display: { sm: 'none' },
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(26, 26, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: 2,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(26, 26, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}