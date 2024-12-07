import { type FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface TokenBalanceProps {
  className?: string;
  showBuyButton?: boolean;
}

export const TokenBalance: FC<TokenBalanceProps> = ({ 
  className = '', 
  showBuyButton = true 
}) => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        // Implement balance fetching logic
        setBalance(0);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [publicKey]);

  if (!publicKey) return null;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
        <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />
        <span className="font-medium">
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            balance ?? '0'
          )}
        </span>
      </div>

      {showBuyButton && (
        <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900">
          Buy Tokens
        </button>
      )}
    </div>
  );
}; 