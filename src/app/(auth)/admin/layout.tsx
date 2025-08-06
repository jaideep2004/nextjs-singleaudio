'use client';

import TopNavigation from '@/components/TopNavigation';
import { Container } from '@mui/material';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavigation title="Karhari Media" />
      <main>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
          {children}
        </Container>
      </main>
    </>
  );
}
