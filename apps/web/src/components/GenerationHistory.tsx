import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useWallet } from '@/contexts/WalletContext';
import { PhotoIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Generation {
  id: string;
  imageUrl: string;
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  metadata: {
    style?: string;
    settings?: any;
  };
}

export function GenerationHistory() {
  const { isConnected } = useWallet();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isConnected) {
      fetchGenerations();
    }
  }, [isConnected, page]);

  const fetchGenerations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/generations?page=${page}&limit=12`);
      const data = await response.json();
      
      if (page === 1) {
        setGenerations(data.generations);
      } else {
        setGenerations(prev => [...prev, ...data.generations]);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch generations:', error);
      toast.error('Failed to load generation history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintNFT = async (generationId: string) => {
    try {
      const response = await fetch('/api/v1/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationId }),
      });

      if (!response.ok) throw new Error('Failed to mint NFT');

      toast.success('NFT minting started! Check your NFTs page for status.');
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      toast.error('Failed to mint NFT. Please try again.');
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <PhotoIcon className="w-12 h-12 mx-auto text-gray-600" />
        <h3 className="mt-4 text-lg font-medium">Connect Wallet to View History</h3>
        <p className="mt-2 text-gray-400">
          Your generation history will appear here after connecting your wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generation History</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((generation) => (
          <div
            key={generation.id}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
          >
            <div className="aspect-square relative">
              {generation.status === 'completed' ? (
                <Image
                  src={generation.imageUrl}
                  alt={generation.prompt}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  {generation.status === 'pending' ? (
                    <ArrowPathIcon className="w-8 h-8 animate-spin text-orange-500" />
                  ) : (
                    <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
                  )}
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm line-clamp-2">{generation.prompt}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {new Date(generation.createdAt).toLocaleDateString()}
                </span>
                {generation.status === 'completed' && (
                  <button
                    onClick={() => handleMintNFT(generation.id)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium"
                  >
                    Mint NFT
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
} 