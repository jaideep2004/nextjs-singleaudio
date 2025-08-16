import Link from 'next/link';
import { Box, Container } from '@mui/material';
import PublicNavBar from '@/components/PublicNavBar';
import ClientOnly from '@/components/ClientOnly';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
];

const authItems = [
  { label: 'Login', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <ClientOnly>
        <PublicNavBar />
      </ClientOnly>
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
       