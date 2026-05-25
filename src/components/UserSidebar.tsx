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
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Album,
  TrendingUp,
  CloudUpload as CloudUploadIcon,
  Podcasts as PodcastsIcon,
  BarChart as AnalyticsIcon,
  AccountBalanceWallet,
  Person as PersonIcon,
  LibraryMusic,
  VideoLibrary,
  LockOutlined,
  YouTube,
} from '@mui/icons-material';

import { useAuth } from '@/context/AppContext';

const drawerWidth = 264;
const collapsedDrawerWidth = 76;

const menuSections = [
  {
    label: 'Music Distribution',
    items: [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
      {
        text: 'Create New Release',
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
          { text: 'Tracks', path: '/dashboard/tracks' },
        ],
      },
      {
        text: 'Analytics',
        icon: <AnalyticsIcon />,
        path: '/dashboard/analytics',
      },
      {
        text: 'Music Publishing',
        icon: <LibraryMusic />,
        path: '/dashboard/music-publishing',
      },
      {
        text: 'Vevo Video Distribution',
        icon: <VideoLibrary />,
        path: '/dashboard/vevo-video-distribution',
      },
      {
        text: 'YouTube Network',
        icon: <YouTube />,
        path: '/dashboard/youtube-network',
      },
      {
        text: 'Podcasts',
        icon: <PodcastsIcon />,
        path: '/dashboard/podcasts',
        subItems: [
          { text: 'Upload Episode', path: '/dashboard/podcasts' },
          { text: 'Payouts', path: '/dashboard/podcasts?view=payouts' },
        ],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        text: 'Profile',
        icon: <PersonIcon />,
        path: '/dashboard/profile',
      },
      {
        text: 'Settings',
        icon: <SettingsIcon />,
        path: '/dashboard/settings',
      },
      {
        text: 'Royalties',
        icon: <TrendingUp />,
        path: '/dashboard/royalties',
        subItems: [
          { text: 'Statement', path: '/dashboard/royalties?view=statement' },
          { text: 'Report', path: '/dashboard/royalties?view=report' },
        ],
      },
      {
        text: 'Payouts',
        icon: <AccountBalanceWallet />,
        path: '/dashboard/payouts',
        subItems: [
          { text: 'Payment Method', path: '/dashboard/payouts?view=method' },
        ],
      }, 
    ],
  },
];

export default function UserSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const auth = useAuth();
  const user = auth?.user;
  const kycUnderReview = user?.verification?.status === 'submitted' && (user.role === 'artist' || user.role === 'label');

  const isDark = theme.palette.mode === 'dark';
  const desktopCollapsed = collapsed && !isMobile;
  const currentDrawerWidth = desktopCollapsed ? collapsedDrawerWidth : drawerWidth;

  // Auto-expand submenus when on matching routes
  useEffect(() => {
    if (pathname.startsWith('/dashboard/podcasts')) {
      setOpenSubMenu('/dashboard/podcasts');
    }
    if (pathname.startsWith('/dashboard/releases')) {
      setOpenSubMenu('/dashboard/releases');
    }
    if (pathname.startsWith('/dashboard/royalties')) {
      setOpenSubMenu('/dashboard/royalties');
    }
    if (pathname.startsWith('/dashboard/payouts')) {
      setOpenSubMenu('/dashboard/payouts');
    }
  }, [pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubMenuClick = (item: string) => {
    setOpenSubMenu(openSubMenu === item ? null : item);
  };

  const handleDesktopCollapse = () => {
    setCollapsed((current) => !current);
    setOpenSubMenu(null);
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
      // No query param — active only when pathname matches and no view/status param set
      return pathname === subPath && !searchParams.get('view') && !searchParams.get('status');
    }
    const subParams = new URLSearchParams(subQuery);
    const subView = subParams.get('view');
    const subStatus = subParams.get('status');
    const subTab = subParams.get('tab');
    if (subView) return pathname === subPath && searchParams.get('view') === subView;
    if (subStatus) return pathname === subPath && searchParams.get('status') === subStatus;
    if (subTab) return pathname === subPath && searchParams.get('tab') === subTab;
    return pathname === subPath;
  };

  const isUnlockedDuringReview = (path: string) => {
    const [basePath] = path.split('?');
    return basePath === '/dashboard' || basePath === '/dashboard/profile' || basePath === '/dashboard/support';
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
          justifyContent: desktopCollapsed ? 'center' : 'space-between',
        }}
      >
        {!desktopCollapsed && (
          <Box
            component="img"
            src={isDark ? '/images/singleaudio-b.png' : '/images/singleaudio-w.png'}
            alt="Single Audio"
            sx={{
              width: 195,
              height: 45,
              objectFit: 'contain',
              objectPosition: 'left center',
              display: 'block',
            }}
          />
        )}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            display: { md: 'none' },
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Tooltip title={desktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="right">
          <IconButton
            onClick={handleDesktopCollapse}
            aria-label={desktopCollapsed ? 'Expand dashboard sidebar' : 'Collapse dashboard sidebar'}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              width: 36,
              height: 36,
              color: isDark ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.58)',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)',
              },
            }}
          >
            {desktopCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
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
                display: desktopCollapsed ? 'none' : 'block',
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.4)',
                letterSpacing: '0.08em',
                fontWeight: 700,
                fontSize: '0.65rem',
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item: any) => {
                const lockedItem = kycUnderReview && !isUnlockedDuringReview(item.path);
                return (
                <div key={item.path}>
                  <ListItem disablePadding sx={{ mb: 0.25 }}>
                    <Tooltip title={desktopCollapsed ? item.text : ''} placement="right" disableInteractive>
                      <ListItemButton
                        selected={isActive(item.path)}
                        disabled={lockedItem}
                        onClick={() =>
                          lockedItem
                            ? undefined
                            : desktopCollapsed
                              ? router.push(item.path)
                              : item.subItems
                                ? handleSubMenuClick(item.path)
                                : router.push(item.path)
                        }
                        sx={{
                        borderRadius: '10px',
                        mx: 0.75,
                        py: 0.85,
                        px: desktopCollapsed ? 1 : 1.5,
                        minHeight: 44,
                        justifyContent: desktopCollapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        transition: 'background-color 150ms ease, color 150ms ease',
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
                          transition: 'height 200ms ease',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: desktopCollapsed ? 0 : 36,
                          color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.45)',
                          '& .MuiSvgIcon-root': { fontSize: 20 },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{ display: desktopCollapsed ? 'none' : 'block' }}
                        primaryTypographyProps={{
                          fontWeight: isActive(item.path) ? 800 : 700,
                          fontSize: '0.875rem',
                          letterSpacing: '-0.005em',
                          color: isActive(item.path)
                            ? (isDark ? '#93b4ff' : '#3b5fe5')
                            : (isDark ? 'rgba(255, 255, 255, 0.84)' : 'rgba(15, 23, 42, 0.88)'),
                        }}
                      />
                      {lockedItem && !desktopCollapsed && (
                        <LockOutlined sx={{ fontSize: 15, color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,23,42,0.32)', mr: 0.5 }} />
                      )}
                      {item.subItems && !desktopCollapsed && (
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
                    </Tooltip>
                  </ListItem>
                  {item.subItems && !desktopCollapsed && (
                    <Collapse in={openSubMenu === item.path} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ py: 0.25 }}>
                        {item.subItems.map((subItem: any) => {
                          const lockedSubItem = kycUnderReview && !isUnlockedDuringReview(subItem.path);
                          return (
                          <ListItemButton
                            key={subItem.path}
                            selected={isSubItemActive(subItem.path)}
                            disabled={lockedSubItem}
                            onClick={() => {
                              if (!lockedSubItem) router.push(subItem.path);
                            }}
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
                                fontWeight: 650,
                                color: isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.76)',
                              }}
                            />
                            {lockedSubItem && (
                              <LockOutlined sx={{ fontSize: 14, color: 'text.disabled', mr: 1 }} />
                            )}
                          </ListItemButton>
                        )})}
                      </List>
                    </Collapse>
                  )}
                </div>
              )})}
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
          display: desktopCollapsed ? 'none' : 'block',
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
          Single Audio v2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
          transition: 'width 180ms ease',
        }}
        aria-label="navigation sidebar"
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
              width: currentDrawerWidth,
              border: 'none',
              backgroundColor: 'transparent',
              transition: 'width 180ms ease',
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
