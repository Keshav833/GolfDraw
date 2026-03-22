import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import Providers from '@/components/providers';
import { TopLoader } from '@/components/ui/TopLoader';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
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
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
