import { WalletButton } from '@/components/WalletButton';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-transparent bg-clip-text">
          Soba AI Platform
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Generate unique AI profile pictures and mint them as NFTs
        </p>
        <WalletButton />
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">AI Generation</h3>
          <p className="text-gray-300">
            Create unique profile pictures using state-of-the-art AI technology
          </p>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">NFT Minting</h3>
          <p className="text-gray-300">
            Turn your favorite generations into NFTs on the Solana blockchain
          </p>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Token System</h3>
          <p className="text-gray-300">
            Use platform tokens to generate images and mint NFTs
          </p>
        </div>
      </section>
    </div>
  );
}
