import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { WalletContextProvider } from '@/contexts/WalletContext';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'bg-gray-800 text-white',
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </div>
    </WalletContextProvider>
  );
} 