import { Connection, Keypair } from '@solana/web3.js';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { NFTService } from '../lib/nft';
import { MetadataValidator } from '../lib/validation';

describe('NFT Service', () => {
  let connection: Connection;
  let payer: Keypair;
  let nftService: NFTService;

  beforeEach(() => {
    connection = new Connection('http://localhost:8899', 'confirmed');
    payer = Keypair.generate();
    nftService = new NFTService(connection, payer);
  });

  describe('Metadata Validation', () => {
    it('should validate correct metadata', () => {
      const validMetadata = {
        name: 'Test NFT',
        symbol: 'TEST',
        description: 'This is a test NFT description',
        image: 'https://example.com/image.png',
        external_url: 'https://example.com/nft',
        attributes: [
          { trait_type: 'Background', value: 'Blue' },
        ],
        properties: {
          files: [
            {
              uri: 'https://example.com/image.png',
              type: 'image/png',
            },
          ],
          category: 'image',
          creators: [
            {
              address: '3Duk5b6PcGVY3RyGhzxkQg3mhUbvhUNmZYGhUbvhUNm',
              share: 100,
            },
          ],
        },
        seller_fee_basis_points: 500,
        collection: {
          name: 'Test Collection',
          family: 'Test Family',
        },
      };

      const result = MetadataValidator.validateMetadata(validMetadata);
      if (!result.isValid && result.errors) {
        console.error('Validation errors:', JSON.stringify(result.errors.format(), null, 2));
      }
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid metadata', () => {
      const invalidMetadata = {
        name: '', // Invalid: too short
        symbol: 'TEST',
        description: 'Test', // Invalid: too short
        image: 'not-a-url',
        attributes: [],
        properties: {
          files: [],
          category: 'invalid-category',
          creators: [],
        },
      };

      const result = MetadataValidator.validateMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should validate attributes separately', () => {
      const validAttributes = [
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Eyes', value: 'Green' },
      ];

      const result = MetadataValidator.validateAttributes(validAttributes);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate creators separately', () => {
      const validCreators = [
        {
          address: '3Duk5b6PcGVY3RyGhzxkQg3mhUbvhUNmZYGhUbvhUNm',
          share: 100,
        },
      ];

      const result = MetadataValidator.validateCreators(validCreators);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });
}); 