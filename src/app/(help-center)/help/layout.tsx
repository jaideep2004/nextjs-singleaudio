import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SingleAudio Help Center',
  description: 'Operational guides and support for SingleAudio users.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
