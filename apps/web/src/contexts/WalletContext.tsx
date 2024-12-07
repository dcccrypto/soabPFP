import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { WalletAdapterNetwork, WalletError, WalletName } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface WalletContextType {
  isConnecting: boolean;
  isConnected: boolean;
  hasError: boolean;
  errorMessage: string;
  balance: number | null;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Constants
const BALANCE_REFRESH_INTERVAL = 30000; // 30 seconds
const MOBILE_WALLET_URLS = {
  phantom: 'https://phantom.app/ul/browse',
  solflare: 'https://solflare.com/ul/browse',
};

function WalletContextProviderInner({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { 
    connected,
    connecting,
    disconnect: solanaDisconnect,
    select,
    publicKey,
    wallet,
  } = useSolanaWallet();

  const [isConnecting, setIsConnecting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  const handleError = useCallback((error: Error) => {
    setHasError(true);
    setErrorMessage(error.message);
    setIsConnecting(false);
  }, []);

  // Balance tracking
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) return;
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [publicKey, connection]);

  // Auto-refresh balance
  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, BALANCE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [connected, publicKey, fetchBalance]);

  // Mobile deep linking
  const getMobileWalletUrl = useCallback((walletName: string) => {
    const baseUrl = MOBILE_WALLET_URLS[walletName as keyof typeof MOBILE_WALLET_URLS];
    if (!baseUrl) return null;
    
    // Add any additional parameters needed for deep linking
    const params = new URLSearchParams({
      dapp: window.location.host,
      network: WalletAdapterNetwork.Devnet,
    });
    
    return `${baseUrl}?${params.toString()}`;
  }, []);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setHasError(false);
      setErrorMessage('');

      // Check if we're on mobile and handle deep linking
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && wallet) {
        const deepLink = getMobileWalletUrl(wallet.adapter.name.toLowerCase());
        if (deepLink) {
          window.location.href = deepLink;
          return;
        }
      }

      // Select wallet if not already selected
      if (!wallet) {
        // Default to Phantom wallet
        select('Phantom' as WalletName);
      }

      // Wait for connection
      await new Promise<void>((resolve) => {
        const checkConnection = () => {
          if (connected) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });

      setIsConnecting(false);
    } catch (error) {
      handleError(error as Error);
    }
  }, [wallet, select, connected, handleError, getMobileWalletUrl]);

  const disconnect = useCallback(async () => {
    try {
      await solanaDisconnect();
      setBalance(null);
    } catch (error) {
      handleError(error as Error);
    }
  }, [solanaDisconnect, handleError]);

  const value = {
    isConnecting: isConnecting || connecting,
    isConnected: connected,
    hasError,
    errorMessage,
    balance,
    publicKey: publicKey?.toBase58() || null,
    connect,
    disconnect,
    refreshBalance: fetchBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Network configuration
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletContextProviderInner>
          {children}
        </WalletContextProviderInner>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }
  return context;
} 