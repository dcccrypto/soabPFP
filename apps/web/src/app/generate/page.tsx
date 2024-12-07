'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GenerationForm } from '@/components/GenerationForm';
import { GenerationHistory } from '@/components/GenerationHistory';
import { TokenBalance } from '@/components/TokenBalance';
import { useWallet } from '@/contexts/WalletContext';
import toast from 'react-hot-toast';

export default function GeneratePage() {
  const { isConnected } = useWallet();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(10);

  const handleGenerate = async (request: any) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await fetch('/api/v1/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setCurrentImage(data.imageUrl);
      setRemainingGenerations(prev => Math.max(0, prev - 1));
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Generate AI Profile Picture</h1>
          <TokenBalance />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <div className="card">
            <GenerationForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              remainingGenerations={remainingGenerations}
            />
          </div>

          {/* Preview */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Generated profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No image generated yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generation History */}
        <GenerationHistory />
      </div>
    </ProtectedRoute>
  );
} 