import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isConnected, isConnecting } = useWallet();

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isConnecting, router]);

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
} 