import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from '@/components/ClientProviders';
import ThemeRegistry from '@/app/ThemeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Karhari Media - Music Distribution Platform',
  description: 'Distribute your music worldwide with Karhari Media',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeRegistry>
          <ClientProviders>{children}</ClientProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}
