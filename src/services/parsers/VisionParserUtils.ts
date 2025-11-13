import { VisionReceiptResponse } from '../../types/ReceiptParser';
import { Reciept, LineItem, Type } from '../../types/Reciept';

/**
 * Shared utilities for vision-based receipt parsers (Claude, Groq, etc.)
 */

/**
 * Convert vision API response to standardized Receipt format
 * @param data - Vision response data
 * @param source - Provider source identifier (e.g., 'claude-vision', 'groq-llama-vision')
 * @param owner - Provider owner identifier (e.g., 'claude', 'groq')
 * @param ocrScore - Estimated OCR accuracy score (0-1)
 * @returns Standardized Receipt object
 */
export function convertVisionResponseToReceipt(
  data: VisionReceiptResponse,
  source: string,
  owner: string,
  ocrScore: number = 0.9
): Reciept {
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
    type: mapItemType(item.type),
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
      ocr_score: ocrScore,
      owner: owner,
      pages: [],
      processed_pages: 1,
      source: source,
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
    reference_number: `${owner}-${Date.now()}`,
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
 * Map item type string to Type enum
 */
function mapItemType(type?: string): Type | null {
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
