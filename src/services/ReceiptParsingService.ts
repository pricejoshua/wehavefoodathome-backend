import { IReceiptParser, ReceiptParserProvider } from '../types/ReceiptParser';
import { ClaudeReceiptParser } from './parsers/ClaudeReceiptParser';
import { GroqReceiptParser } from './parsers/GroqReceiptParser';
import { VeryfiReceiptParser } from './parsers/VeryfiReceiptParser';
import { Receipt } from '../types/Receipt';

/**
 * Unified receipt parsing service that supports multiple providers
 */
export class ReceiptParsingService {
  private parser: IReceiptParser;
  private provider: ReceiptParserProvider;

  constructor(provider?: ReceiptParserProvider) {
    // Use environment variable or default to Claude
    this.provider = provider ?? this.getDefaultProvider();
    this.parser = this.createParser(this.provider);
  }

  /**
   * Get default provider from environment variable
   */
  private getDefaultProvider(): ReceiptParserProvider {
    const envProvider = process.env.RECEIPT_PARSER_PROVIDER?.toLowerCase();

    switch (envProvider) {
      case 'claude':
        return ReceiptParserProvider.CLAUDE;
      case 'groq':
        return ReceiptParserProvider.GROQ;
      case 'veryfi':
        return ReceiptParserProvider.VERYFI;
      default:
        // Default to Claude if available, otherwise Groq, otherwise Veryfi
        if (process.env.ANTHROPIC_API_KEY) {
          return ReceiptParserProvider.CLAUDE;
        } else if (process.env.GROQ_API_KEY) {
          return ReceiptParserProvider.GROQ;
        } else if (process.env.VERYFI_API_KEY) {
          return ReceiptParserProvider.VERYFI;
        }
        throw new Error('No receipt parser API keys configured. Please set ANTHROPIC_API_KEY, GROQ_API_KEY, or VERYFI_API_KEY');
    }
  }

  /**
   * Create parser instance based on provider
   */
  private createParser(provider: ReceiptParserProvider): IReceiptParser {
    switch (provider) {
      case ReceiptParserProvider.CLAUDE: {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error('ANTHROPIC_API_KEY environment variable is required for Claude provider');
        }
        const model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
        return new ClaudeReceiptParser(apiKey, model);
      }

      case ReceiptParserProvider.GROQ: {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          throw new Error('GROQ_API_KEY environment variable is required for Groq provider');
        }
        const model = process.env.GROQ_MODEL || 'llama-3.2-90b-vision-preview';
        return new GroqReceiptParser(apiKey, model);
      }

      case ReceiptParserProvider.VERYFI: {
        const clientId = process.env.VERYFI_CLIENT_ID;
        const clientSecret = process.env.VERYFI_CLIENT_SECRET;
        const username = process.env.VERYFI_USERNAME;
        const apiKey = process.env.VERYFI_API_KEY;

        if (!clientId || !clientSecret || !username || !apiKey) {
          throw new Error('Veryfi credentials are incomplete. Required: VERYFI_CLIENT_ID, VERYFI_CLIENT_SECRET, VERYFI_USERNAME, VERYFI_API_KEY');
        }

        return new VeryfiReceiptParser(clientId, clientSecret, username, apiKey);
      }

      default:
        throw new Error(`Unsupported receipt parser provider: ${provider}`);
    }
  }

  /**
   * Parse a receipt image
   */
  async parseReceipt(imageUrl: string, mimeType?: string): Promise<Receipt> {
    console.log(`Parsing receipt with ${this.parser.getProviderName()}...`);

    try {
      const result = await this.parser.parseReceipt(imageUrl, mimeType);
      console.log(`Successfully parsed receipt with ${this.parser.getProviderName()}`);
      return result;
    } catch (error) {
      console.error(`Failed to parse receipt with ${this.parser.getProviderName()}:`, error);
      throw error;
    }
  }

  /**
   * Get the current provider name
   */
  getProviderName(): string {
    return this.parser.getProviderName();
  }

  /**
   * Get the current provider enum value
   */
  getProvider(): ReceiptParserProvider {
    return this.provider;
  }

  /**
   * Create a new service instance with a specific provider
   */
  static withProvider(provider: ReceiptParserProvider): ReceiptParsingService {
    return new ReceiptParsingService(provider);
  }

  /**
   * Get list of available providers based on configured API keys
   */
  static getAvailableProviders(): ReceiptParserProvider[] {
    const providers: ReceiptParserProvider[] = [];

    if (process.env.ANTHROPIC_API_KEY) {
      providers.push(ReceiptParserProvider.CLAUDE);
    }
    if (process.env.GROQ_API_KEY) {
      providers.push(ReceiptParserProvider.GROQ);
    }
    if (process.env.VERYFI_API_KEY && process.env.VERYFI_CLIENT_ID) {
      providers.push(ReceiptParserProvider.VERYFI);
    }

    return providers;
  }
}
