import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  CheckCircleOutline,
  MusicNote,
  ShowChart,
  Payments,
  Storefront,
  Devices,
} from '@mui/icons-material';

// Metadata for SEO
export const metadata = {
  title: 'SoundWave - Distribute Your Music Worldwide',
  description: 'Distribute your music to all major streaming platforms like Spotify, Apple Music, and more. Keep 100% of your royalties.',
  keywords: ['music distribution', 'artist platform', 'royalties', 'music streaming'],
};

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          pt: { xs: 10, md: 15 },
          pb: { xs: 10, md: 15 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Distribute Your Music Worldwide
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 400,
                  mb: 4,
                  opacity: 0.9,
                }}
              >
                Get your music on Spotify, Apple Music, and 150+ streaming platforms while keeping 100% of your royalties.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={Link}
                  href="/signup"
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ fontWeight: 600, color: 'white', px: 4, py: 1.5 }}
                >
                  Get Started
                </Button>
                <Button
                  component={Link}
                  href="/#pricing"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{ fontWeight: 600, px: 4, py: 1.5 }}
                >
                  View Pricing
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {/* Add a placeholder image or illustration */}
                <Box
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    p: 3,
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" textAlign="center">
                    Music Distribution Platform
                    <br />
                    <Typography variant="h6" sx={{ mt: 2, opacity: 0.7 }}>
                      Interactive Dashboard Illustration
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 10, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            align="center"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Everything You Need
          </Typography>
          <Typography
            variant="h5"
            component="p"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
          >
            Powerful tools to help independent artists distribute music and manage their career
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <MusicNote fontSize="large" color="primary" />,
                title: 'Simple Music Upload',
                description:
                  'Upload your tracks in just a few clicks and reach millions of listeners worldwide',
              },
              {
                icon: <Storefront fontSize="large" color="primary" />,
                title: 'Global Distribution',
                description:
                  'Get your music on Spotify, Apple Music, Amazon, TikTok, and 150+ platforms',
              },
              {
                icon: <ShowChart fontSize="large" color="primary" />,
                title: 'Real-time Analytics',
                description:
                  'Track your streams, revenue, and audience insights with comprehensive dashboards',
              },
              {
                icon: <Payments fontSize="large" color="primary" />,
                title: 'Fast Payments',
                description:
                  'Receive your royalties monthly with flexible payout options including PayPal and UPI',
              },
              {
                icon: <Devices fontSize="large" color="primary" />,
                title: 'Artist Profile',
                description:
                  'Create your public artist profile to showcase your music and connect with fans',
              },
              {
                icon: <CheckCircleOutline fontSize="large" color="primary" />,
                title: 'Keep 100% Rights',
                description:
                  'Maintain complete ownership of your music and receive 100% of your royalties',
              },
            ].map((feature, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography gutterBottom variant="h5" component="h3" fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            align="center"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h5"
            component="p"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
          >
            No hidden fees. No royalty splits. Just straightforward pricing that works for you.
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                title: 'Single',
                price: '$9.99',
                period: 'per single',
                description: 'Perfect for releasing individual songs',
                features: [
                  'One track distribution',
                  'All major streaming platforms',
                  'Keep 100% of royalties',
                  'Real-time statistics',
                  'Unlimited worldwide audience',
                  'Cover art included',
                ],
                buttonText: 'Get Started',
                buttonVariant: 'outlined',
              },
              {
                title: 'Album',
                price: '$29.99',
                period: 'per album',
                description: 'Ideal for full albums or EPs',
                features: [
                  'Up to 15 tracks',
                  'All major streaming platforms',
                  'Keep 100% of royalties',
                  'Advanced analytics',
                  'Unlimited worldwide audience',
                  'Priority support',
                ],
                buttonText: 'Get Started',
                buttonVariant: 'contained',
                highlighted: true,
              },
              {
                title: 'Unlimited',
                price: '$99.99',
                period: 'per year',
                description: 'For serious artists with multiple releases',
                features: [
                  'Unlimited track uploads',
                  'All major streaming platforms',
                  'Keep 100% of royalties',
                  'Advanced analytics & reporting',
                  'Unlimited worldwide audience',
                  'Priority support & account manager',
                ],
                buttonText: 'Get Started',
                buttonVariant: 'outlined',
              },
            ].map((tier, i) => (
              <Grid
                item
                key={tier.title}
                xs={12}
                md={4}
                sx={{
                  display: 'flex',
                }}
              >
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    p: 3,
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: tier.highlighted
                      ? '0 8px 32px rgba(62, 81, 181, 0.15)'
                      : '0 5px 15px rgba(0,0,0,0.05)',
                    border: tier.highlighted ? '2px solid #3E51B5' : 'none',
                    transform: tier.highlighted ? 'scale(1.05)' : 'none',
                    zIndex: tier.highlighted ? 2 : 1,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: tier.highlighted ? 'scale(1.07)' : 'scale(1.02)',
                      boxShadow: tier.highlighted
                        ? '0 12px 40px rgba(62, 81, 181, 0.2)'
                        : '0 10px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h4"
                      component="h3"
                      align="center"
                      gutterBottom
                      fontWeight={600}
                      color={tier.highlighted ? 'primary.main' : 'inherit'}
                    >
                      {tier.title}
                    </Typography>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h3" component="p" fontWeight={700}>
                        {tier.price}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {tier.period}
                      </Typography>
                    </Box>
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      {tier.description}
                    </Typography>
                    <List sx={{ mb: 4 }}>
                      {tier.features.map((feature) => (
                        <ListItem key={feature} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleOutline color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button
                      component={Link}
                      href="/signup"
                      fullWidth
                      variant={tier.highlighted ? 'contained' : 'outlined'}
                      color="primary"
                      size="large"
                    >
                      {tier.buttonText}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            align="center"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Artists Love SoundWave
          </Typography>
          <Typography
            variant="h5"
            component="p"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
          >
            Join thousands of independent artists who trust SoundWave for music distribution
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                quote:
                  "SoundWave has transformed my music career. I'm reaching more fans than ever before and the royalty tracking is absolutely amazing.",
                name: 'Alex Johnson',
                title: 'Electronic Producer',
              },
              {
                quote:
                  "The dashboard is intuitive and the analytics give me insights I've never had before. Plus, getting paid monthly is a game-changer for independent artists.",
                name: 'Maria Garcia',
                title: 'Singer-Songwriter',
              },
              {
                quote:
                  "I've tried several distribution platforms, but SoundWave offers the best value. The unlimited plan lets me experiment with releases without worrying about costs.",
                name: 'James Wilson',
                title: 'Hip-Hop Artist',
              },
            ].map((testimonial, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Typography
                      variant="body1"
                      component="p"
                      sx={{ mb: 3, fontStyle: 'italic' }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.title}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Ready to Share Your Music with the World?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: 'auto' }}
          >
            Join thousands of artists who trust SoundWave for music distribution. Get started today and reach listeners worldwide.
          </Typography>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ fontWeight: 600, color: 'white', px: 5, py: 1.5 }}
          >
            Start Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                SoundWave
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The music distribution platform for independent artists.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Distribution
              </Typography>
              <List disablePadding>
                {['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'TikTok'].map(
                  (item) => (
                    <ListItem key={item} disablePadding sx={{ pb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    </ListItem>
                  )
                )}
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Company
              </Typography>
              <List disablePadding>
                {['About Us', 'Blog', 'Careers', 'Contact Us', 'Help Center'].map(
                  (item) => (
                    <ListItem key={item} disablePadding sx={{ pb: 0.5 }}>
                      <Link href="#" passHref>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          {item}
                        </Typography>
                      </Link>
                    </ListItem>
                  )
                )}
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Legal
              </Typography>
              <List disablePadding>
                {['Terms of Service', 'Privacy Policy', 'Copyright Policy', 'Royalty Policy'].map(
                  (item) => (
                    <ListItem key={item} disablePadding sx={{ pb: 0.5 }}>
                      <Link href="#" passHref>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          {item}
                        </Typography>
                      </Link>
                    </ListItem>
                  )
                )}
              </List>
            </Grid>
          </Grid>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 5 }}
          >
            © {new Date().getFullYear()} SoundWave. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
} 