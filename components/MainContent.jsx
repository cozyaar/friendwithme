'use client';
import { usePathname } from 'next/navigation';

export default function MainContent({ children }) {
  const pathname = usePathname();
  const isFullScreen = pathname === '/explore' || pathname?.startsWith('/messages/');
  
  return (
    <main className={`relative z-0 min-h-screen ${isFullScreen ? 'pt-[80px] pb-16 md:pb-0' : 'pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto'}`}>
      {children}
    </main>
  );
}
