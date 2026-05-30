import './globals.css';
import type { Metadata } from 'next';
import ClientProviders from '@/components/ClientProviders';
import ThemeRegistry from '@/app/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Single Audio - Music Distribution Platform',
  description: 'Distribute your music worldwide with Single Audio',
  icons: {
    icon: '/images/favicon-s2.png',
    shortcut: '/images/favicon-s2.png',
    apple: '/images/favicon-s2.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeRegistry>
          <ClientProviders>{children}</ClientProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}
