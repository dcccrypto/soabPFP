import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

export interface TreasuryConfig {
  feeCollector: PublicKey;
  mintingFee: number; // In SOL
  royaltyBasisPoints: number; // 100 = 1%
}

export class TreasuryService {
  private connection: Connection;
  private config: TreasuryConfig;

  constructor(connection: Connection, config: TreasuryConfig) {
    this.connection = connection;
    this.config = config;
  }

  async collectMintingFee(
    payer: PublicKey,
    feePayer: Keypair
  ): Promise<string> {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: this.config.feeCollector,
          lamports: this.config.mintingFee * LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = feePayer.publicKey;
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signature = await this.connection.sendTransaction(
        transaction,
        [feePayer]
      );

      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error collecting minting fee:', error);
      throw new Error('Failed to collect minting fee');
    }
  }

  async distributeRoyalties(
    saleAmount: number,
    creators: Array<{ address: PublicKey; share: number }>,
    treasury: Keypair
  ): Promise<string> {
    try {
      const transaction = new Transaction();
      const royaltyAmount = (saleAmount * this.config.royaltyBasisPoints) / 10000;

      // Distribute royalties according to creator shares
      for (const creator of creators) {
        const creatorAmount = (royaltyAmount * creator.share) / 100;
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: treasury.publicKey,
            toPubkey: creator.address,
            lamports: creatorAmount * LAMPORTS_PER_SOL,
          })
        );
      }

      transaction.feePayer = treasury.publicKey;
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signature = await this.connection.sendTransaction(
        transaction,
        [treasury]
      );

      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error distributing royalties:', error);
      throw new Error('Failed to distribute royalties');
    }
  }

  async getTreasuryBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.config.feeCollector);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting treasury balance:', error);
      throw new Error('Failed to get treasury balance');
    }
  }

  async withdrawTreasuryFunds(
    amount: number,
    recipient: PublicKey,
    authority: Keypair
  ): Promise<string> {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.config.feeCollector,
          toPubkey: recipient,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = authority.publicKey;
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signature = await this.connection.sendTransaction(
        transaction,
        [authority]
      );

      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error withdrawing treasury funds:', error);
      throw new Error('Failed to withdraw treasury funds');
    }
  }

  async updateTreasuryConfig(
    updates: Partial<TreasuryConfig>,
    authority: Keypair
  ): Promise<void> {
    // Implement treasury config updates (would typically involve a program call)
    this.config = {
      ...this.config,
      ...updates,
    };
  }

  // Analytics and reporting methods
  async getRoyaltyStats(
    startTime: number,
    endTime: number
  ): Promise<{
    totalRoyalties: number;
    distributionCount: number;
    averageRoyalty: number;
  }> {
    // Implement royalty statistics tracking
    // This would typically involve querying an indexer or database
    return {
      totalRoyalties: 0,
      distributionCount: 0,
      averageRoyalty: 0,
    };
  }

  async verifyRoyaltyCompliance(
    mintAddress: string
  ): Promise<{
    isCompliant: boolean;
    expectedRoyalty: number;
    actualRoyalty: number;
  }> {
    // Implement royalty compliance verification
    // This would typically involve checking the NFT metadata and recent sales
    return {
      isCompliant: true,
      expectedRoyalty: this.config.royaltyBasisPoints / 100,
      actualRoyalty: this.config.royaltyBasisPoints / 100,
    };
  }
} 