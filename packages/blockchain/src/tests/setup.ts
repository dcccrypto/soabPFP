import { Connection, Keypair } from '@solana/web3.js';

// Mock functions
const mockGetVersion = jest.fn().mockResolvedValue({ 'solana-core': '1.14.0' });
const mockGetBalance = jest.fn().mockResolvedValue(1000000000);
const mockGetLatestBlockhash = jest.fn().mockResolvedValue({
  blockhash: 'EHsCAKZGHWnwqeZnzLyEn6wckePqtGbsTvQQ3mQGqRu3',
  lastValidBlockHeight: 150,
});
const mockConfirmTransaction = jest.fn().mockResolvedValue({ value: { err: null } });

// Mock Solana web3.js
jest.mock('@solana/web3.js', () => {
  const actualModule = jest.requireActual('@solana/web3.js');

  class MockPublicKey {
    constructor(key: string) {
      return {
        toBase58: () => key,
        toString: () => key,
      };
    }
  }

  return {
    ...actualModule,
    Connection: jest.fn().mockImplementation(() => ({
      getVersion: mockGetVersion,
      getBalance: mockGetBalance,
      getLatestBlockhash: mockGetLatestBlockhash,
      confirmTransaction: mockConfirmTransaction,
    })),
    PublicKey: MockPublicKey,
    Keypair: {
      generate: () => ({
        publicKey: new MockPublicKey('TestPublicKey'),
        secretKey: new Uint8Array(32),
      }),
    },
  };
});

// Mock Metaplex
const mockMetaplex = {
  nfts: {
    create: jest.fn().mockResolvedValue({ nft: { address: 'TestNFTAddress' } }),
    findByMint: jest.fn().mockResolvedValue({ address: 'TestNFTAddress' }),
  },
  use: jest.fn().mockReturnThis(),
};

jest.mock('@metaplex-foundation/js', () => ({
  Metaplex: {
    make: jest.fn().mockReturnValue(mockMetaplex),
  },
  bundlrStorage: jest.fn().mockReturnValue({}),
  keypairIdentity: jest.fn().mockReturnValue({}),
})); 