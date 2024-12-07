import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface GenerationFormProps {
  onGenerate: (request: any) => Promise<void>;
  isGenerating: boolean;
  remainingGenerations: number;
}

export function GenerationForm({
  onGenerate,
  isGenerating,
  remainingGenerations,
}: GenerationFormProps) {
  const { isConnected } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('anime');
  const [settings, setSettings] = useState({
    quality: 'standard',
    aspectRatio: '1:1',
    variations: 1,
  });

  const styles = [
    { id: 'anime', name: 'Anime' },
    { id: 'realistic', name: 'Realistic' },
    { id: 'artistic', name: 'Artistic' },
    { id: 'pixel', name: 'Pixel Art' },
  ];

  const qualities = [
    { id: 'standard', name: 'Standard', tokens: 1 },
    { id: 'high', name: 'High Quality', tokens: 2 },
    { id: 'ultra', name: 'Ultra HD', tokens: 4 },
  ];

  const aspectRatios = [
    { id: '1:1', name: 'Square', dimensions: '1024x1024' },
    { id: '3:4', name: 'Portrait', dimensions: '768x1024' },
    { id: '4:3', name: 'Landscape', dimensions: '1024x768' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (remainingGenerations <= 0) {
      toast.error('No generations remaining. Please purchase more tokens.');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      await onGenerate({
        prompt,
        style,
        settings: {
          ...settings,
          model: 'stable-diffusion-xl',
        },
      });
    } catch (error) {
      toast.error('Generation failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Prompt
        </label>
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your perfect profile picture..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <SparklesIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {styles.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium
                ${style === s.id
                  ? 'bg-orange-500 border-orange-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Quality
        </label>
        <div className="grid grid-cols-3 gap-3">
          {qualities.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setSettings({ ...settings, quality: q.id })}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium
                ${settings.quality === q.id
                  ? 'bg-orange-500 border-orange-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <div>{q.name}</div>
              <div className="text-xs opacity-75">{q.tokens} tokens</div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-3">
          {aspectRatios.map((ar) => (
            <button
              key={ar.id}
              type="button"
              onClick={() => setSettings({ ...settings, aspectRatio: ar.id })}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium
                ${settings.aspectRatio === ar.id
                  ? 'bg-orange-500 border-orange-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <div>{ar.name}</div>
              <div className="text-xs opacity-75">{ar.dimensions}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {remainingGenerations} generations remaining
        </div>
        <button
          type="submit"
          disabled={isGenerating || !isConnected || remainingGenerations <= 0}
          className={`
            px-6 py-3 rounded-lg font-medium flex items-center space-x-2
            ${isGenerating
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'
            }
          `}
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
} 