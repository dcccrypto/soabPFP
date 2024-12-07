import { useWallet } from '@/contexts/WalletContext';
import { useCallback } from 'react';

export function WalletButton() {
  const { isConnecting, isConnected, hasError, errorMessage, connect, disconnect } = useWallet();

  const handleClick = useCallback(async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  }, [isConnected, connect, disconnect]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleClick}
          className="btn-secondary text-red-500"
          disabled={isConnecting}
        >
          Error: Try Again
        </button>
        <span className="text-sm text-red-500">{errorMessage}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`btn-primary ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Connecting...
        </div>
      ) : isConnected ? (
        'Disconnect Wallet'
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
} 