'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  MusicNote as MusicNoteIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Album,
  TrendingUp,
  CloudUpload as CloudUploadIcon,
  Podcasts as PodcastsIcon
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: 'Upload',
    icon: <CloudUploadIcon />,
    path: '/dashboard/upload',
  },
  {
    text: 'Releases',
    icon: <Album />,
    path: '/dashboard/releases',
    subItems: [
      { text: 'All Releases', path: '/dashboard/releases' },
      { text: 'Pending', path: '/dashboard/releases?status=pending' },
      { text: 'Approved', path: '/dashboard/releases?status=approved' },
      { text: 'Rejected', path: '/dashboard/releases?status=rejected' },
    ],
  },
  {
    text: 'Tracks',
    icon: <MusicNoteIcon />,
    path: '/dashboard/tracks',
  },
  {
    text: 'Royalties',
    icon: <TrendingUp />,
    path: '/dashboard/royalties',
  },
  {
    text: 'Payouts',
    icon: <PaymentIcon />,
    path: '/dashboard/payouts',
  },
  {
    text: 'Podcasts',
    icon: <PodcastsIcon />,
    path: '/dashboard/podcasts',
    subItems: [
      { text: 'My Podcast', path: '/dashboard/podcasts' },
      { text: 'Episodes', path: '/dashboard/podcasts?view=episodes' },
      { text: 'Analytics', path: '/dashboard/podcasts?view=analytics' },
    ],
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/dashboard/settings',
  },
];

export default function UserSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  // Auto-expand Podcasts submenu when on podcasts route
  useEffect(() => {
    if (pathname.startsWith('/dashboard/podcasts')) {
      setOpenSubMenu('/dashboard/podcasts');
    }
  }, [pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubMenuClick = (item: string) => {
    setOpenSubMenu(openSubMenu === item ? null : item);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // For sub-items that may include query params
  const isSubItemActive = (path: string) => {
    const [subPath, subQuery] = path.split('?');
    if (!subQuery) {
      // No query param — active only when pathname matches and no view param set
      return pathname === subPath && !searchParams.get('view');
    }
    const subParams = new URLSearchParams(subQuery);
    const subView = subParams.get('view');
    return pathname === subPath && searchParams.get('view') === subView;
  };

  const drawer = (
    <Box 
      sx={{ 
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 32, 0.94)' : '#ffffff',
        borderRight: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        // ultra-thin scrollbar
        scrollbarWidth: 'thin',
        scrollbarColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.22) transparent' : 'rgba(15,23,42,0.22) transparent',
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.22)',
          borderRadius: 10,
        },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
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
          Artist Panel
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
        <Box sx={{ px: 3, pb: 1.25 }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: 1.2, fontWeight: 700 }}
          >
            Music Distribution
          </Typography>
        </Box>
        {menuItems.map((item) => (
          <div key={item.path}>
            {item.text === 'Podcasts' && (
              <Box sx={{ px: 3, pt: 2, pb: 1.25 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', letterSpacing: 1.2, fontWeight: 700 }}
                >
                  Podcasts
                </Typography>
              </Box>
            )}
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
                  position: 'relative',
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
                  '&.Mui-selected::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 10,
                    bottom: 10,
                    width: 3,
                    borderRadius: 4,
                    backgroundColor: theme.palette.primary.main,
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
                      selected={isSubItemActive(subItem.path)}
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
          Karhari Media Artist v1.0
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
