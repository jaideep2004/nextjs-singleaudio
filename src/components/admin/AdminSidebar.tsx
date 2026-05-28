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
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
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
  LibraryMusic,
  VideoLibrary,
  YouTube,
  Article as ArticleIcon,
  SupportAgent,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import { useNotifications } from '@/context/NotificationsContext';
import { hasAdminPermission, isFullAdmin, type AdminPermission } from '@/lib/adminAccess';
import { countUnreadSupportNotifications } from '@/components/support/supportNotifications';

const drawerWidth = 264;
const collapsedDrawerWidth = 76;

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
        permission: 'users' as AdminPermission,
      },
      {
        text: 'Releases',
        icon: <Album />,
        path: '/admin/releases',
        permission: 'review' as AdminPermission,
        subItems: [
          { text: 'All Releases', path: '/admin/releases' },
          { text: 'Pending', path: '/admin/releases?status=pending' },
          { text: 'Approved', path: '/admin/releases?status=approved' },
          { text: 'Rejected', path: '/admin/releases?status=rejected' },
          { text: 'Export Catalog', path: '/admin/export' },
        ],
      },
      {
        text: 'DSP Deliveries',
        icon: <CloudUploadIcon />,
        path: '/admin/dsp-deliveries',
        permission: 'dsp_delivery' as AdminPermission,
      },
      {
        text: 'Analytics',
        icon: <TrendingUp />,
        path: '/admin/analytics',
        permission: 'analytics' as AdminPermission,
      },
      {
        text: 'Music Publishing',
        icon: <LibraryMusic />,
        path: '/admin/music-publishing',
        permission: 'settings' as AdminPermission,
      },
      {
        text: 'Vevo Video Distribution',
        icon: <VideoLibrary />,
        path: '/admin/vevo-video-distribution',
        permission: 'settings' as AdminPermission,
      },
      {
        text: 'YouTube Network',
        icon: <YouTube />,
        path: '/admin/youtube-network',
        permission: 'settings' as AdminPermission,
        subItems: [
          { text: 'Channels', path: '/admin/youtube-network' },
          { text: 'Analytics', path: '/admin/youtube-network/analytics' },
        ],
      },
      {
        text: 'Podcasts',
        icon: <PodcastsIcon />,
        path: '/admin/podcasts',
        permission: 'podcasts' as AdminPermission,
        subItems: [
          { text: 'Manage Podcasts', path: '/admin/podcasts' },
          { text: 'Upload Episode', path: '/admin/podcasts?view=episodes' },
          { text: 'Payouts', path: '/admin/podcasts?view=payouts' },
        ],
      },
      {
        text: 'Knowledge Base',
        icon: <ArticleIcon />,
        path: '/admin/knowledge-base',
        permission: 'support' as AdminPermission,
      },
      {
        text: 'Support Queue',
        icon: <SupportAgent />,
        path: '/admin/support',
        permission: 'support' as AdminPermission,
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
        permission: 'payouts' as AdminPermission,
      },
      {
        text: 'Royalties',
        icon: <TrendingUp />,
        path: '/admin/royalties',
        permission: 'payouts' as AdminPermission,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        text: 'Profile',
        icon: <PersonIcon />,
        path: '/admin/profile',
      },
      {
        text: 'Settings',
        icon: <SettingsIcon />,
        path: '/admin/settings',
        permission: 'settings' as AdminPermission,
      },
    ],
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const isDark = theme.palette.mode === 'dark';
  const desktopCollapsed = collapsed && !isMobile;
  const currentDrawerWidth = desktopCollapsed ? collapsedDrawerWidth : drawerWidth;
  const unreadSupportCount = countUnreadSupportNotifications(notifications);
  const canSee = (item: any) => {
    if (isFullAdmin(user)) return true;
    if (!item.permission) return false;

    return hasAdminPermission(user, item.permission);
  };

  // Auto-expand submenus when on matching routes
  useEffect(() => {
    if (pathname.startsWith('/admin/releases')) {
      setOpenSubMenu('/admin/releases');
    }
    if (pathname.startsWith('/admin/export')) {
      setOpenSubMenu('/admin/releases');
    }
    if (pathname.startsWith('/admin/podcasts')) {
      setOpenSubMenu('/admin/podcasts');
    }
    if (pathname.startsWith('/admin/support')) {
      setOpenSubMenu(null);
    }
    if (pathname.startsWith('/admin/youtube-network')) {
      setOpenSubMenu('/admin/youtube-network');
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
    if (path === '/admin/dashboard') {
      return pathname === path;
    }
    if (path === '/admin/releases') {
      return pathname.startsWith('/admin/releases') || pathname.startsWith('/admin/export');
    }
    return pathname.startsWith(path);
  };

  const isSubItemActive = (path: string) => {
    const [subPath, subQuery] = path.split('?');
    if (!subQuery) {
      return pathname === subPath && !searchParams.get('view') && !searchParams.get('status');
    }

    const subParams = new URLSearchParams(subQuery);
    const subView = subParams.get('view');
    const subStatus = subParams.get('status');
    if (subView) return pathname === subPath && searchParams.get('view') === subView;
    if (subStatus) return pathname === subPath && searchParams.get('status') === subStatus;
    return pathname === subPath;
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
            src={isDark ? '/images/singleaudio-b1.png' : '/images/singleaudio-w.png'}
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
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Tooltip title={desktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="right">
          <IconButton
            onClick={handleDesktopCollapse}
            aria-label={desktopCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
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
        {menuSections
          .map((section) => ({ ...section, items: section.items.filter(canSee) }))
          .filter((section) => section.items.length > 0)
          .map((section, sectionIdx, sections) => (
          <Box key={section.label} sx={{ mb: sectionIdx < sections.length - 1 ? 0.5 : 0 }}>
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
                const isSupportItem = item.path === '/admin/support';
                return (
                <div key={item.path}>
                  <ListItem disablePadding sx={{ mb: 0.25 }}>
                    <Tooltip title={desktopCollapsed ? item.text : ''} placement="right" disableInteractive>
                      <ListItemButton
                        selected={isActive(item.path)}
                        onClick={() =>
                          desktopCollapsed
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
                        <Badge
                          badgeContent={isSupportItem ? unreadSupportCount : 0}
                          color="error"
                          invisible={!isSupportItem || unreadSupportCount === 0 || !desktopCollapsed}
                          max={99}
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.62rem',
                              height: 16,
                              minWidth: 16,
                            },
                          }}
                        >
                          {item.icon}
                        </Badge>
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
                      {isSupportItem && !desktopCollapsed && unreadSupportCount > 0 && (
                        <Box
                          component="span"
                          sx={{
                            mr: 0.75,
                            minWidth: 18,
                            height: 18,
                            px: 0.6,
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'error.main',
                            color: 'error.contrastText',
                            fontSize: '0.68rem',
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        >
                          {Math.min(unreadSupportCount, 99)}
                        </Box>
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
                        {item.subItems.map((subItem: any) => (
                          <ListItemButton
                            key={subItem.path}
                            selected={isSubItemActive(subItem.path)}
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
                                fontWeight: 650,
                                color: isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.76)',
                              }}
                            />
                          </ListItemButton>
                        ))}
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
          Single Audio Admin v2.0
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
