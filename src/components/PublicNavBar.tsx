"use client";
import { useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { label: 'Login', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
];

export default function PublicNavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box
        component="img"
        src={theme.palette.mode === 'dark' ? '/images/singleaudio-b1.png' : '/images/singleaudio-w.png'}
        alt="SingleAudio Distribution"
        sx={{ width: 190, maxWidth: '80%', my: 2 }}
      />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} component={Link} href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        component="nav"
        position="static"
        elevation={0}
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? '#05050a' : '#ffffff',
          color: theme.palette.mode === 'dark' ? '#ffffff' : '#05050a',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(5,5,10,0.10)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component={Link}
            href="/login"
            sx={{
              flexGrow: 1,
              display: 'inline-flex',
              justifyContent: { xs: 'center', md: 'flex-start' },
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <Box
              component="img"
              src={theme.palette.mode === 'dark' ? '/images/singleaudio-b1.png' : '/images/singleaudio-w.png'}
              alt="SingleAudio Distribution"
              sx={{ width: { xs: 180, sm: 220 }, maxHeight: 44, objectFit: 'contain' }}
            />
          </Box>
          {!isMobile && (
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button key={item.label} color="inherit" component={Link} href={item.href}>
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
