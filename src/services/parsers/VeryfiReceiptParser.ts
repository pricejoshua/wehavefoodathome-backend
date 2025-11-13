import Client from '@veryfi/veryfi-sdk';
import { IReceiptParser } from '../../types/ReceiptParser';
import { Reciept, parseRecieptData } from '../../types/Reciept';

/**
 * Veryfi receipt parser implementation
 */
export class VeryfiReceiptParser implements IReceiptParser {
  private client: Client;

  constructor(clientId: string, clientSecret: string, username: string, apiKey: string) {
    this.client = new Client(clientId, clientSecret, username, apiKey);
  }

  getProviderName(): string {
    return 'Veryfi';
  }

  /**
   * Parse receipt using Veryfi API
   */
  async parseReceipt(imageUrl: string, mimeType?: string): Promise<Reciept> {
    try {
      // Process document with Veryfi using URL
      // Note: Using process_document method which can accept URLs
      const response = await (this.client as any).process_document_url?.(imageUrl)
        ?? await (this.client as any).process_document(imageUrl);

      // Convert Veryfi response to our Reciept format
      return parseRecieptData(response);
    } catch (error) {
      console.error('Error parsing receipt with Veryfi:', error);
      throw new Error(`Failed to parse receipt with Veryfi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
