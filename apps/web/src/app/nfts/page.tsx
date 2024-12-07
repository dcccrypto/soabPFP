import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function NFTsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My NFT Collection</h1>
        
        {/* Placeholder for NFT collection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="aspect-square bg-gray-700 rounded-lg mb-4 animate-pulse" />
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
} 