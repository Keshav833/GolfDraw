import type { Metadata } from 'next';
import './globals.css';
import { Inter, DM_Serif_Display, DM_Sans } from 'next/font/google';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import Providers from '@/components/providers';
import { TopLoader } from '@/components/ui/TopLoader';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'GolfDraw',
  description: 'Golf Scores. Real Prizes. Good Causes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'font-sans',
        inter.variable,
        dmSerif.variable,
        dmSans.variable
      )}
    >
      <body className="antialiased">
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
