import { useWallet } from '@/contexts/WalletContext';

export function WalletStatus() {
  const { isConnected, balance } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-sm text-gray-300">Connected</span>
      </div>
      {balance !== null && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Balance:</span>
          <span className="text-sm font-medium">{balance} SOL</span>
        </div>
      )}
    </div>
  );
} 