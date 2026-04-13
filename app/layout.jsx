import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ProfileProvider } from '@/context/ProfileContext';
import MainContent from '@/components/MainContent';
import { Suspense } from 'react';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
  title: 'Friend With Me',
  description: 'Find your vibe. Meet your people.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans relative`}>
        <div className="fixed inset-0 bg-soft-gradient -z-20" />
        {/* Soft background orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-blue/20 blur-[120px] -z-10" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-pink/20 blur-[120px] -z-10" />

        <ProfileProvider>
          <Navbar />
          <Suspense fallback={null}>
            <MainContent>{children}</MainContent>
          </Suspense>
        </ProfileProvider>
      </body>
    </html>
  );
}
