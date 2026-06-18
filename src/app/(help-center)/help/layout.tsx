import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Single Audio Help Center',
  description: 'Operational guides and support for Single Audio users.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
