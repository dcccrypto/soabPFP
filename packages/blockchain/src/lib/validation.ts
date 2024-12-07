import { z } from 'zod';

// Metadata Standards
export const MetadataStandard = {
  SOLANA_METAPLEX: 'metaplex',
  SOLANA_TOKEN: 'spl-token',
} as const;

// Attribute Schema
const AttributeSchema = z.object({
  trait_type: z.string().min(1).max(50),
  value: z.string().min(1).max(50),
});

// File Schema
const FileSchema = z.object({
  uri: z.string().url(),
  type: z.string().regex(/^image\/(png|jpeg|gif|webp)$/),
});

// Creator Schema
const CreatorSchema = z.object({
  address: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
  share: z.number().min(0).max(100),
  verified: z.boolean().optional(),
});

// Properties Schema
const PropertiesSchema = z.object({
  files: z.array(FileSchema),
  category: z.enum(['image', 'video', 'audio', 'vr', '3d']),
  creators: z.array(CreatorSchema),
});

// Complete Metadata Schema
export const NFTMetadataSchema = z.object({
  name: z.string().min(3).max(32),
  symbol: z.string().min(1).max(10),
  description: z.string().min(10).max(1000),
  image: z.string().url(),
  external_url: z.string().url().optional(),
  attributes: z.array(AttributeSchema),
  properties: PropertiesSchema,
  seller_fee_basis_points: z.number().min(0).max(10000),
  collection: z.object({
    name: z.string(),
    family: z.string(),
  }).optional(),
});

export class MetadataValidator {
  static validateMetadata(metadata: unknown): {
    isValid: boolean;
    errors?: z.ZodError;
  } {
    try {
      NFTMetadataSchema.parse(metadata);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error };
      }
      throw error;
    }
  }

  static validateAttributes(attributes: unknown): {
    isValid: boolean;
    errors?: z.ZodError;
  } {
    try {
      z.array(AttributeSchema).parse(attributes);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error };
      }
      throw error;
    }
  }

  static validateCreators(creators: unknown): {
    isValid: boolean;
    errors?: z.ZodError;
  } {
    try {
      z.array(CreatorSchema).parse(creators);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error };
      }
      throw error;
    }
  }

  static validateFiles(files: unknown): {
    isValid: boolean;
    errors?: z.ZodError;
  } {
    try {
      z.array(FileSchema).parse(files);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error };
      }
      throw error;
    }
  }

  static getMetadataTemplate(): z.infer<typeof NFTMetadataSchema> {
    return {
      name: '',
      symbol: 'SOBA',
      description: '',
      image: '',
      attributes: [],
      properties: {
        files: [],
        category: 'image',
        creators: [],
      },
      seller_fee_basis_points: 500,
    };
  }
} 