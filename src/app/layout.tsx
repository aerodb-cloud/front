import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AERO — Serverless Postgres Platform',
  description: 'DBaaS platform powered by Neon',
};

import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen antialiased`}>
        <SessionProvider refetchOnWindowFocus={false}>
          {children}
        </SessionProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
