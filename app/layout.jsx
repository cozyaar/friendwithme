import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ProfileProvider } from '@/context/ProfileContext';

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
          <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen relative z-0">
            {children}
          </main>
        </ProfileProvider>
      </body>
    </html>
  );
}
