import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { initializeBlockchain } from '../index';
import { DEFAULT_MINTING_FEE, DEFAULT_ROYALTY_BASIS_POINTS } from '../index';

export interface BlockchainInitConfig {
  network: 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';
  payerSecretKey?: Uint8Array;
  feeCollectorAddress?: string;
  mintingFee?: number;
  royaltyBasisPoints?: number;
  customRpcUrl?: string;
}

export async function initializeBlockchainServices(config: BlockchainInitConfig) {
  // Set up connection
  const connectionUrl = config.customRpcUrl || 
    (config.network === 'localnet' ? 'http://localhost:8899' : clusterApiUrl(config.network));
  const connection = new Connection(connectionUrl, 'confirmed');

  // Set up payer
  const payer = config.payerSecretKey 
    ? Keypair.fromSecretKey(config.payerSecretKey)
    : Keypair.generate();

  // Set up treasury config
  const feeCollector = config.feeCollectorAddress 
    ? new PublicKey(config.feeCollectorAddress)
    : payer.publicKey;

  const treasuryConfig = {
    feeCollector,
    mintingFee: config.mintingFee || DEFAULT_MINTING_FEE,
    royaltyBasisPoints: config.royaltyBasisPoints || DEFAULT_ROYALTY_BASIS_POINTS,
  };

  // Initialize services
  const services = initializeBlockchain({
    connection,
    payer,
    treasuryConfig,
  });

  // Verify connection
  try {
    const version = await connection.getVersion();
    console.log(`Connected to Solana ${config.network}, version:`, version);
  } catch (error) {
    console.error('Failed to connect to Solana network:', error);
    throw new Error('Blockchain initialization failed: Connection error');
  }

  return {
    ...services,
    connection,
    payer,
    network: config.network,
  };
}

export async function verifyConnection(connection: Connection): Promise<boolean> {
  try {
    const version = await connection.getVersion();
    return version !== null;
  } catch {
    return false;
  }
}

export function getDefaultConfig(network: BlockchainInitConfig['network'] = 'devnet'): BlockchainInitConfig {
  return {
    network,
    mintingFee: DEFAULT_MINTING_FEE,
    royaltyBasisPoints: DEFAULT_ROYALTY_BASIS_POINTS,
  };
} 