import Replicate from 'replicate';
import type { GenerationRequest, GenerationResponse } from '@soba/types';

export interface SobaAIConfig {
  apiKey: string;
  model: `${string}/${string}` | `${string}/${string}:${string}`;
}

interface GenerationSettings {
  prompt: string;
  negative_prompt?: string;
  [key: string]: any;
}

const DEFAULT_SETTINGS: GenerationSettings = {
  model: 'dev',
  go_fast: false,
  lora_scale: 1,
  megapixels: '1',
  num_outputs: 1,
  aspect_ratio: '1:1',
  output_format: 'webp',
  guidance_scale: 3,
  output_quality: 80,
  prompt_strength: 0.8,
  extra_lora_scale: 1,
  num_inference_steps: 28,
};

export class SobaAI {
  private replicate: Replicate;
  private config: SobaAIConfig;
  private model = 'dcccrypto/soba:e0e293b97de2af9d7ad1851c13b14e01036fa7040b6dd39eec05d18f76dcc997';

  constructor(config: SobaAIConfig) {
    this.config = {
      maxDailyGenerations: 10,
      defaultSettings: {},
      ...config,
    };

    this.replicate = new Replicate({
      auth: config.apiKey,
    });
  }

  private enhancePrompt(prompt: string): GenerationSettings {
    const styleModifiers = [
      'high quality',
      'detailed',
      'sharp focus',
      'professional lighting'
    ].join(', ');

    return {
      prompt: `${prompt}, ${styleModifiers}`,
      negative_prompt: 'blurry, low quality, distorted, deformed'
    };
  }

  private validateSettings(settings?: Partial<GenerationSettings>): GenerationSettings {
    return {
      ...DEFAULT_SETTINGS,
      ...this.config.defaultSettings,
      ...settings,
    };
  }

  async generate(prompt: string, settings: Partial<GenerationSettings> = {}): Promise<GenerationResponse> {
    try {
      const validatedSettings = {
        ...this.DEFAULT_SETTINGS,
        ...settings
      };

      const enhancedPrompt = this.enhancePrompt(prompt);
      const input = {
        ...validatedSettings,
        prompt: enhancedPrompt.prompt,
        negative_prompt: enhancedPrompt.negative_prompt
      };

      const output = await this.replicate.run(this.model, { input });

      if (Array.isArray(output) && output.length > 0) {
        return {
          id: Date.now().toString(),
          imageUrl: output[0],
          status: 'completed',
          metadata: {
            prompt,
            settings: validatedSettings,
            model: this.model,
            timestamp: new Date().toISOString(),
          },
        };
      }

      throw new Error('No image generated');
    } catch (error) {
      console.error('Error generating image:', error);
      return {
        id: Date.now().toString(),
        imageUrl: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to generate image',
      };
    }
  }

  async generateVariations(
    imageUrl: string,
    count: number = 3
  ): Promise<GenerationResponse[]> {
    try {
      const variations = await Promise.all(
        Array(count).fill(null).map(() =>
          this.replicate.run(this.model, {
            input: {
              ...DEFAULT_SETTINGS,
              init_image: imageUrl,
              prompt_strength: 0.6, // Lower strength to maintain similarity
            },
          })
        )
      );

      return variations.map((output, index) => ({
        id: `${Date.now()}-${index}`,
        imageUrl: Array.isArray(output) ? output[0] : '',
        status: 'completed',
        metadata: {
          sourceImage: imageUrl,
          variationIndex: index,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error generating variations:', error);
      return [{
        id: Date.now().toString(),
        imageUrl: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to generate variations',
      }];
    }
  }
} 