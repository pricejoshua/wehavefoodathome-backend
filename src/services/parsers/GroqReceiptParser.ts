import Groq from 'groq-sdk';
import { IReceiptParser, VisionReceiptResponse } from '../../types/ReceiptParser';
import { Receipt } from '../../types/Receipt';
import axios from 'axios';
import { convertVisionResponseToReceipt } from './VisionParserUtils';

/**
 * Groq Llama Vision receipt parser implementation
 */
export class GroqReceiptParser implements IReceiptParser {
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string = 'llama-3.2-90b-vision-preview') {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  getProviderName(): string {
    return 'Groq Llama Vision';
  }

  /**
   * Parse receipt using Groq Llama Vision API
   */
  async parseReceipt(imageUrl: string, mimeType: string = 'image/jpeg'): Promise<Receipt> {
    try {
      // Groq supports direct image URLs, but we'll convert to base64 for consistency
      const imageBase64 = await this.downloadImageAsBase64(imageUrl);
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      // Create the prompt for Groq
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

      // Call Groq API
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.1, // Lower temperature for more consistent parsing
        max_tokens: 4096,
      });

      // Extract response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from Groq');
      }

      // Parse JSON response
      let jsonText = content.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const visionResponse: VisionReceiptResponse = JSON.parse(jsonText);

      // Convert to Receipt format using shared utility
      return convertVisionResponseToReceipt(visionResponse, 'groq-llama-vision', 'groq', 0.9);
    } catch (error) {
      console.error('Error parsing receipt with Groq:', error);
      throw new Error(`Failed to parse receipt with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
