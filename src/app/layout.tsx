import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

const gotham = localFont({
  src: [
    { path: '../assets/fonts/gotham-htf-book.otf', weight: '400', style: 'normal' },
    { path: '../assets/fonts/gotham-medium.ttf', weight: '500', style: 'normal' },
    { path: '../assets/fonts/gotham-bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-gotham',
});

export const metadata: Metadata = {
  title: 'AERO — Serverless Postgres Platform',
  description: 'DBaaS platform powered by Neon',
};

import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", gotham.variable)}>
      <body className={`${gotham.className} bg-zinc-950 text-zinc-50 min-h-screen antialiased`}>
        <SessionProvider refetchOnWindowFocus={false}>
          {children}
        </SessionProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
