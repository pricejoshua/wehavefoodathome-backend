import Anthropic from '@anthropic-ai/sdk';
import { IReceiptParser, VisionReceiptResponse } from '../../types/ReceiptParser';
import { Reciept } from '../../types/Reciept';
import axios from 'axios';
import { convertVisionResponseToReceipt } from './VisionParserUtils';

/**
 * Claude Vision receipt parser implementation
 */
export class ClaudeReceiptParser implements IReceiptParser {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  getProviderName(): string {
    return 'Claude Vision';
  }

  /**
   * Parse receipt using Claude Vision API
   */
  async parseReceipt(imageUrl: string, mimeType: string = 'image/jpeg'): Promise<Reciept> {
    try {
      // Download image and convert to base64
      const imageBase64 = await this.downloadImageAsBase64(imageUrl);

      // Create the prompt for Claude
      const prompt = `You are a receipt parsing assistant. Analyze this receipt image and extract all relevant information.

Return a JSON object with the following structure:
{
  "vendor": {
    "name": "Store name",
    "address": "Store address if visible",
    "phone": "Phone number if visible"
  },
  "date": "YYYY-MM-DD format",
  "total": 0.00,
  "subtotal": 0.00,
  "tax": 0.00,
  "currency_code": "USD",
  "payment_method": "Cash/Card/etc",
  "line_items": [
    {
      "description": "Item name",
      "quantity": 1,
      "price": 0.00,
      "total": 0.00,
      "type": "food" or "product" or "alcohol" or "discount" or "fee"
    }
  ]
}

Important:
- Extract ALL line items from the receipt
- Classify items as 'food', 'product', 'alcohol', 'discount', or 'fee'
- Include quantities (default to 1 if not specified)
- Be precise with numbers
- Return ONLY valid JSON, no markdown formatting`;

      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      // Extract text response
      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      // Parse JSON response
      let jsonText = textContent.text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const visionResponse: VisionReceiptResponse = JSON.parse(jsonText);

      // Convert to Reciept format using shared utility
      return convertVisionResponseToReceipt(visionResponse, 'claude-vision', 'claude', 0.95);
    } catch (error) {
      console.error('Error parsing receipt with Claude:', error);
      throw new Error(`Failed to parse receipt with Claude: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download image from URL and convert to base64
   */
  private async downloadImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data as ArrayBuffer).toString('base64');
    } catch (error) {
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
