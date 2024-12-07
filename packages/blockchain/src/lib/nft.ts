import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  CreateNftInput,
  Nft,
} from '@metaplex-foundation/js';
import { NFTMetadata } from '@soba/types';

export interface MintNFTParams {
  connection: Connection;
  payer: Keypair;
  metadata: NFTMetadata;
  maxSupply?: number;
}

export interface NFTDetails {
  mintAddress: string;
  metadataAddress: string;
  tokenAddress?: string;
  transactionId: string;
}

export class NFTService {
  private metaplex: Metaplex;

  constructor(connection: Connection, payer: Keypair) {
    this.metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      }));
  }

  async uploadMetadata(
    imageUrl: string,
    name: string,
    description: string,
    attributes: Array<{ trait_type: string; value: string }>,
    symbol?: string
  ): Promise<string> {
    try {
      // Prepare metadata
      const metadata = {
        name,
        symbol: symbol || 'SOBA',
        description,
        image: imageUrl,
        attributes,
        properties: {
          files: [
            {
              uri: imageUrl,
              type: 'image/png',
            },
          ],
          category: 'image',
          creators: [
            {
              address: this.metaplex.identity().publicKey.toBase58(),
              share: 100,
            },
          ],
        },
      };

      // Upload to Arweave via Bundlr
      const { uri } = await this.metaplex.nfts().uploadMetadata(metadata);
      return uri;
    } catch (error) {
      console.error('Error uploading metadata:', error);
      throw new Error('Failed to upload NFT metadata');
    }
  }

  async mintNFT(params: MintNFTParams): Promise<NFTDetails> {
    try {
      const {
        metadata,
        maxSupply,
      } = params;

      // Upload metadata
      const metadataUri = await this.uploadMetadata(
        metadata.imageUrl,
        metadata.name,
        metadata.description,
        metadata.attributes,
        metadata.symbol
      );

      // Prepare mint configuration
      const mintConfig: CreateNftInput = {
        uri: metadataUri,
        name: metadata.name,
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 500, // 5% default royalty
        symbol: metadata.symbol,
        creators: [
          {
            address: this.metaplex.identity().publicKey,
            share: 100,
            authority: this.metaplex.identity(),
          },
        ],
        isMutable: true,
      };

      // Add collection if specified
      if (metadata.collection) {
        mintConfig.collection = metadata.collection;
      }

      // Create NFT
      const { nft, response } = await this.metaplex.nfts().create(mintConfig);

      return {
        mintAddress: nft.address.toBase58(),
        metadataAddress: nft.metadataAddress.toBase58(),
        tokenAddress: nft.tokenAddress?.toBase58(),
        transactionId: response.signature,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw new Error('Failed to mint NFT');
    }
  }

  async transferNFT(nft: Nft, fromWallet: PublicKey, toWallet: PublicKey): Promise<string> {
    try {
      const { response } = await this.metaplex.nfts().transfer({
        nftOrSft: nft,
        fromOwner: fromWallet,
        toOwner: toWallet,
      });

      return response.signature;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }

  async verifyNFTCollection(
    mintAddress: string,
    collectionMint: string
  ): Promise<string> {
    try {
      const mint = new PublicKey(mintAddress);
      const collection = new PublicKey(collectionMint);

      const nft = await this.metaplex.nfts().findByMint({ mintAddress: mint });
      const { response } = await this.metaplex.nfts().verifyCollection({
        mintAddress: mint,
        collectionMintAddress: collection,
      });

      return response.signature;
    } catch (error) {
      console.error('Error verifying collection:', error);
      throw new Error('Failed to verify NFT collection');
    }
  }

  async updateNFTMetadata(
    mintAddress: string,
    updates: Partial<NFTMetadata>
  ): Promise<string> {
    try {
      const mint = new PublicKey(mintAddress);
      const nft = await this.metaplex.nfts().findByMint({ mintAddress: mint });

      const { response } = await this.metaplex.nfts().update({
        nftOrSft: nft,
        name: updates.name,
        symbol: updates.symbol,
        uri: updates.uri,
        sellerFeeBasisPoints: updates.sellerFeeBasisPoints,
      });

      return response.signature;
    } catch (error) {
      console.error('Error updating NFT metadata:', error);
      throw new Error('Failed to update NFT metadata');
    }
  }

  async burnNFT(mintAddress: string, owner: Keypair): Promise<string> {
    try {
      const mint = new PublicKey(mintAddress);
      const nft = await this.metaplex.nfts().findByMint({ mintAddress: mint });

      const { response } = await this.metaplex.nfts().delete({
        mintAddress: mint,
        authority: owner,
      });

      return response.signature;
    } catch (error) {
      console.error('Error burning NFT:', error);
      throw new Error('Failed to burn NFT');
    }
  }
} 