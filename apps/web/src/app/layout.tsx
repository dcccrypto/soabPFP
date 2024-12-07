import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WalletContextProvider } from '@/contexts/WalletContext';
import { Header } from '@/components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Soba AI Platform',
  description: 'Generate unique AI profile pictures and mint them as NFTs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            <Header />
            <main className="pt-20">
              {children}
            </main>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
} 