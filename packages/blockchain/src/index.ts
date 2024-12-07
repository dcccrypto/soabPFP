export * from './lib/nft';
export * from './lib/collection';
export * from './lib/treasury';

import { NFTService } from './lib/nft';
import { CollectionService } from './lib/collection';
import { TreasuryService } from './lib/treasury';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

interface BlockchainConfig {
  connection: Connection;
  payer: Keypair;
  treasuryConfig: {
    feeCollector: PublicKey;
    mintingFee: number;
    royaltyBasisPoints: number;
  };
}

let nftService: NFTService | null = null;
let collectionService: CollectionService | null = null;
let treasuryService: TreasuryService | null = null;

export function initializeBlockchain(config: BlockchainConfig) {
  nftService = new NFTService(config.connection, config.payer);
  collectionService = new CollectionService(config.connection, config.payer);
  treasuryService = new TreasuryService(config.connection, config.treasuryConfig);

  return {
    nftService,
    collectionService,
    treasuryService,
  };
}

export function getNFTService(): NFTService {
  if (!nftService) {
    throw new Error('Blockchain services not initialized');
  }
  return nftService;
}

export function getCollectionService(): CollectionService {
  if (!collectionService) {
    throw new Error('Blockchain services not initialized');
  }
  return collectionService;
}

export function getTreasuryService(): TreasuryService {
  if (!treasuryService) {
    throw new Error('Blockchain services not initialized');
  }
  return treasuryService;
}

// Utility functions
export function createKeypairFromSecret(secret: Uint8Array): Keypair {
  return Keypair.fromSecretKey(secret);
}

export function createConnectionFromEndpoint(endpoint: string): Connection {
  return new Connection(endpoint, 'confirmed');
}

// Constants
export const NETWORK_ENDPOINTS = {
  MAINNET: 'https://api.mainnet-beta.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
  TESTNET: 'https://api.testnet.solana.com',
} as const;

export const DEFAULT_MINTING_FEE = 0.1; // SOL
export const DEFAULT_ROYALTY_BASIS_POINTS = 500; // 5% 