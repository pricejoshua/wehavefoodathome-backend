import { Reciept } from './Reciept';

/**
 * Supported receipt parsing providers
 */
export enum ReceiptParserProvider {
  CLAUDE = 'claude',
  GROQ = 'groq',
  VERYFI = 'veryfi'
}

/**
 * Configuration options for receipt parsing
 */
export interface ReceiptParserConfig {
  provider: ReceiptParserProvider;
  apiKey: string;
  model?: string;
}

/**
 * Base interface for all receipt parsers
 */
export interface IReceiptParser {
  /**
   * Parse a receipt image and extract structured data
   * @param imageUrl - URL or base64 encoded image
   * @param mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
   * @returns Parsed receipt data
   */
  parseReceipt(imageUrl: string, mimeType?: string): Promise<Reciept>;

  /**
   * Get the provider name
   */
  getProviderName(): string;
}

/**
 * Response from vision models (Claude, Groq)
 */
export interface VisionReceiptResponse {
  vendor: {
    name: string;
    address?: string;
    phone?: string;
  };
  date?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  line_items: {
    description: string;
    quantity: number;
    price?: number;
    total?: number;
    type?: 'food' | 'product' | 'alcohol' | 'discount' | 'fee';
  }[];
  currency_code?: string;
  payment_method?: string;
}
