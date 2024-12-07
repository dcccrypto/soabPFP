import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { WalletStatus } from './WalletStatus';
import { useWallet } from '@/contexts/WalletContext';

export function Header() {
  const pathname = usePathname();
  const { isConnected } = useWallet();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 text-transparent bg-clip-text">
              Soba AI
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {isConnected && (
                <>
                  <Link
                    href="/generate"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/generate') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Generate
                  </Link>
                  <Link
                    href="/nfts"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/nfts') ? 'text-white font-medium' : ''
                    }`}
                  >
                    My NFTs
                  </Link>
                  <Link
                    href="/tokens"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/tokens') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Buy Tokens
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <WalletStatus />
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
} 