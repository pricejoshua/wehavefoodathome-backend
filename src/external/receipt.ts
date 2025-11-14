import { Receipt } from "../types/Receipt";
import { ReceiptParsingService } from "../services/ReceiptParsingService";
import { ReceiptParserProvider } from "../types/ReceiptParser";

/**
 * Get receipt data by parsing an image URL
 * @param imageUrl - URL of the receipt image
 * @param mimeType - MIME type of the image (default: 'image/jpeg')
 * @param provider - Optional: specify which parser to use (claude, groq, or veryfi)
 * @returns Parsed receipt data
 */
async function getReceiptData(
  imageUrl: string,
  mimeType: string = 'image/jpeg',
  provider?: ReceiptParserProvider
): Promise<Receipt> {
  try {
    // Create parsing service (will auto-detect provider if not specified)
    const parsingService = provider
      ? ReceiptParsingService.withProvider(provider)
      : new ReceiptParsingService();

    console.log(`Using ${parsingService.getProviderName()} to parse receipt`);

    // Parse the receipt
    const receipt = await parsingService.parseReceipt(imageUrl, mimeType);

    return receipt;
  } catch (error) {
    console.error('Error parsing receipt:', error);
    throw error;
  }
}

/**
 * Get list of available receipt parsing providers
 */
export function getAvailableProviders(): ReceiptParserProvider[] {
  return ReceiptParsingService.getAvailableProviders();
}

export default getReceiptData;