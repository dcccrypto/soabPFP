import {
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import {
  Metaplex,
  keypairIdentity,
  toMetaplexFile,
  CreateNftInput,
  Nft,
  NftWithToken,
  findNftsByOwnerOperation,
} from '@metaplex-foundation/js';

export interface CollectionDetails {
  mintAddress: string;
  metadataAddress: string;
  tokenAddress?: string;
  transactionId: string;
}

export interface CollectionNFT {
  mintAddress: string;
  name: string;
  uri: string;
  symbol?: string;
}

export class CollectionService {
  private metaplex: Metaplex;

  constructor(connection: Connection, payer: Keypair) {
    this.metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer));
  }

  async findAllByCollection(collectionMint: string): Promise<CollectionNFT[]> {
    try {
      const mint = new PublicKey(collectionMint);
      const nfts = await this.metaplex
        .operations()
        .execute(findNftsByOwnerOperation({ owner: mint }));
      
      return nfts.map((nft: Nft | NftWithToken) => ({
        mintAddress: nft.address.toBase58(),
        name: nft.name,
        uri: nft.uri,
        symbol: nft.symbol
      }));
    } catch (error) {
      console.error('Error finding collection NFTs:', error);
      throw error;
    }
  }
} 