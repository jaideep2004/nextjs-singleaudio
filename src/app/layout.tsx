import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import ThemeRegistry from '@/app/ThemeRegistry';

export const metadata = {
  title: 'Single Audio - Music Distribution Platform',
  description: 'Distribute your music worldwide with Single Audio',
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
