'use client';

import { useState, useEffect } from 'react';
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
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
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
  Shield as ShieldIcon,
} from '@mui/icons-material';

const drawerWidth = 264;

const menuSections = [
  {
    label: 'Overview',
    items: [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin/dashboard',
      },
    ],
  },
  {
    label: 'Management',
    items: [
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
    ],
  },
  {
    label: 'Finance',
    items: [
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
    ],
  },
  {
    label: 'System',
    items: [
      {
        text: 'Settings',
        icon: <SettingsIcon />,
        path: '/admin/settings',
      },
    ],
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const isDark = theme.palette.mode === 'dark';

  // Auto-expand releases submenu when on releases route
  useEffect(() => {
    if (pathname.startsWith('/admin/releases')) {
      setOpenSubMenu('/admin/releases');
    }
  }, [pathname]);

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
        bgcolor: isDark ? '#0c1120' : '#fafbfd',
        borderRight: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.08)',
        scrollbarWidth: 'thin',
        scrollbarColor: isDark ? 'rgba(255,255,255,0.12) transparent' : 'rgba(15,23,42,0.12) transparent',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
          borderRadius: 10,
        },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            <ShieldIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                fontSize: '1rem',
                lineHeight: 1.2,
                color: isDark ? '#f1f5f9' : '#0f172a',
                letterSpacing: '-0.01em',
              }}
            >
              Single Audio
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.45)',
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
            >
              Admin Panel
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            display: { md: 'none' },
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {/* Admin Badge */}
      <Box sx={{ mx: 2, mb: 2 }}>
        <Chip
          icon={<ShieldIcon sx={{ fontSize: 14 }} />}
          label="Administrator"
          size="small"
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            bgcolor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)',
            color: isDark ? '#fca5a5' : '#dc2626',
            border: '1px solid',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 32,
            '& .MuiChip-icon': {
              color: isDark ? '#fca5a5' : '#dc2626',
            },
          }}
        />
      </Box>

      {/* Navigation Sections */}
      <Box sx={{ flex: 1, px: 1, pb: 2 }}>
        {menuSections.map((section, sectionIdx) => (
          <Box key={section.label} sx={{ mb: sectionIdx < menuSections.length - 1 ? 0.5 : 0 }}>
            <Typography
              variant="overline"
              sx={{
                px: 2,
                pt: sectionIdx > 0 ? 1.5 : 0.5,
                pb: 0.75,
                display: 'block',
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.4)',
                letterSpacing: '0.08em',
                fontWeight: 700,
                fontSize: '0.65rem',
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item: any) => (
                <div key={item.path}>
                  <ListItem disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      selected={isActive(item.path)}
                      onClick={() =>
                        item.subItems
                          ? handleSubMenuClick(item.path)
                          : router.push(item.path)
                      }
                      sx={{
                        borderRadius: '10px',
                        mx: 0.75,
                        py: 0.85,
                        px: 1.5,
                        position: 'relative',
                        transition: 'all 150ms ease',
                        '&.Mui-selected': {
                          backgroundColor: isDark
                            ? 'rgba(74, 108, 247, 0.12)'
                            : 'rgba(74, 108, 247, 0.08)',
                          color: isDark ? '#93b4ff' : '#3b5fe5',
                          '&:hover': {
                            backgroundColor: isDark
                              ? 'rgba(74, 108, 247, 0.18)'
                              : 'rgba(74, 108, 247, 0.12)',
                          },
                          '& .MuiListItemIcon-root': {
                            color: isDark ? '#93b4ff' : '#3b5fe5',
                          },
                        },
                        '&:hover': {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(15, 23, 42, 0.04)',
                        },
                        '&.Mui-selected::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3,
                          height: 20,
                          borderRadius: '0 4px 4px 0',
                          backgroundColor: '#4a6cf7',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.45)',
                          '& .MuiSvgIcon-root': { fontSize: 20 },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive(item.path) ? 600 : 500,
                          fontSize: '0.875rem',
                          letterSpacing: '-0.005em',
                          color: isActive(item.path)
                            ? (isDark ? '#93b4ff' : '#3b5fe5')
                            : (isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.74)'),
                        }}
                      />
                      {item.subItems && (
                        <Box
                          sx={{
                            color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            '& .MuiSvgIcon-root': { fontSize: 18 },
                          }}
                        >
                          {openSubMenu === item.path ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                  {item.subItems && (
                    <Collapse in={openSubMenu === item.path} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ py: 0.25 }}>
                        {item.subItems.map((subItem: any) => (
                          <ListItemButton
                            key={subItem.path}
                            selected={pathname === subItem.path.split('?')[0] &&
                              (subItem.path.includes('?')
                                ? new URLSearchParams(subItem.path.split('?')[1]).get('status') ===
                                  new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('status')
                                : !new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('status'))}
                            onClick={() => router.push(subItem.path)}
                            sx={{
                              borderRadius: '8px',
                              mx: 1.5,
                              py: 0.6,
                              pl: 5.5,
                              position: 'relative',
                              '&.Mui-selected': {
                                backgroundColor: isDark
                                  ? 'rgba(74, 108, 247, 0.08)'
                                  : 'rgba(74, 108, 247, 0.06)',
                                '& .MuiListItemText-primary': {
                                  color: isDark ? '#93b4ff' : '#3b5fe5',
                                  fontWeight: 600,
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 32,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: '#4a6cf7',
                                },
                                '&:hover': {
                                  backgroundColor: isDark
                                    ? 'rgba(74, 108, 247, 0.12)'
                                    : 'rgba(74, 108, 247, 0.08)',
                                },
                              },
                              '&:hover': {
                                backgroundColor: isDark
                                  ? 'rgba(255, 255, 255, 0.03)'
                                  : 'rgba(0, 0, 0, 0.02)',
                              },
                            }}
                          >
                            <ListItemText
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontSize: '0.82rem',
                                fontWeight: 450,
                                color: isDark ? 'rgba(255, 255, 255, 0.55)' : 'rgba(15, 23, 42, 0.6)',
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
          </Box>
        ))}
      </Box>

      {/* Sidebar Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.3)',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          Single Audio Admin v2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="admin navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              backgroundColor: isDark ? '#0c1120' : '#fafbfd',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
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
            top: 14,
            left: 14,
            zIndex: theme.zIndex.drawer + 1,
            display: { md: 'none' },
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: isDark ? 'rgba(12, 17, 32, 0.9)' : 'rgba(255, 255, 255, 0.92)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(12, 17, 32, 0.95)' : 'rgba(255, 255, 255, 0.98)',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
