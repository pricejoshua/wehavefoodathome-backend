import Anthropic from '@anthropic-ai/sdk';
import { IReceiptParser, VisionReceiptResponse } from '../../types/ReceiptParser';
import { Reciept, LineItem, Type } from '../../types/Reciept';
import axios from 'axios';

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

      // Convert to Reciept format
      return this.convertToReceipt(visionResponse);
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

  /**
   * Convert vision response to Reciept format
   */
  private convertToReceipt(data: VisionReceiptResponse): Reciept {
    const lineItems: LineItem[] = data.line_items.map((item, index) => ({
      date: null,
      description: item.description,
      discount: null,
      discount_rate: null,
      end_date: null,
      full_description: item.description,
      hsn: null,
      id: index + 1,
      lot: null,
      normalized_description: item.description.toLowerCase(),
      order: index,
      price: item.price ?? null,
      quantity: item.quantity,
      reference: null,
      section: null,
      sku: null,
      start_date: null,
      tags: [],
      tax: null,
      tax_rate: null,
      text: item.description,
      total: item.total ?? (item.price ? item.price * item.quantity : null),
      type: this.mapItemType(item.type),
      unit_of_measure: null,
      upc: null,
      weight: null,
    }));

    return {
      account_number: null,
      cashback: null,
      category: 'receipt',
      created_date: new Date(),
      currency_code: data.currency_code ?? 'USD',
      date: data.date ? new Date(data.date) : null,
      delivery_date: null,
      discount: null,
      document_reference_number: null,
      document_title: null,
      document_type: 'receipt',
      due_date: null,
      duplicate_of: null,
      external_id: null,
      id: 0, // Will be set by database
      img_file_name: '',
      img_thumbnail_url: '',
      img_url: '',
      insurance: null,
      invoice_number: null,
      is_duplicate: false,
      is_money_in: false,
      line_items: lineItems,
      meta: {
        language: ['en'],
        ocr_score: 0.95, // Claude Vision typically has high accuracy
        owner: 'claude',
        pages: [],
        processed_pages: 1,
        source: 'claude-vision',
        source_documents: [],
        total_pages: 1,
      },
      notes: null,
      ocr_text: '',
      order_date: null,
      payment: {
        card_number: null,
        display_name: null,
        terms: null,
        type: data.payment_method ?? null,
      },
      pdf_url: '',
      purchase_order_number: null,
      reference_number: `claude-${Date.now()}`,
      rounding: null,
      service_end_date: null,
      service_start_date: null,
      shipping: null,
      store_number: null,
      subtotal: data.subtotal ?? 0,
      tags: [],
      tax: data.tax ?? null,
      tax_lines: [],
      tip: null,
      total: data.total,
      total_weight: null,
      tracking_number: null,
      updated_date: new Date(),
      vendor: {
        account_number: null,
        address: data.vendor.address ?? null,
        category: null,
        email: null,
        lat: null,
        lng: null,
        logo: '',
        name: data.vendor.name,
        phone_number: data.vendor.phone ?? null,
        raw_address: data.vendor.address ?? null,
        raw_name: data.vendor.name,
        type: null,
        vat_number: null,
        web: null,
      },
    };
  }

  /**
   * Map item type to Type enum
   */
  private mapItemType(type?: string): Type | null {
    if (!type) return null;

    const typeMap: { [key: string]: Type } = {
      'food': Type.Food,
      'product': Type.Product,
      'alcohol': Type.Alcohol,
      'discount': Type.Discount,
      'fee': Type.Fee,
    };

    return typeMap[type.toLowerCase()] ?? null;
  }
}
