import express from 'express';
import getReceiptData, { getAvailableProviders } from '../external/receipt';
import { ReceiptParserProvider } from '../types/ReceiptParser';
import { Reciept } from '../types/Reciept';

const router = express.Router();

interface ParseReceiptRequest {
  imageUrl: string;
  mimeType?: string;
  provider?: ReceiptParserProvider;
}

interface ParseReceiptResponse {
  success: boolean;
  data?: Reciept;
  error?: string;
  provider?: string;
}

interface ProvidersResponse {
  success: boolean;
  providers: ReceiptParserProvider[];
}

/**
 * POST /receipts/parse - Parse a receipt image
 * Body: { imageUrl: string, mimeType?: string, provider?: string }
 */
router.post<{}, ParseReceiptResponse, ParseReceiptRequest>('/parse', async (req, res) => {
  try {
    const { imageUrl, mimeType, provider } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl is required',
      });
    }

    // Validate provider if specified
    if (provider && !Object.values(ReceiptParserProvider).includes(provider)) {
      return res.status(400).json({
        success: false,
        error: `Invalid provider. Must be one of: ${Object.values(ReceiptParserProvider).join(', ')}`,
      });
    }

    const receipt = await getReceiptData(imageUrl, mimeType, provider);

    res.json({
      success: true,
      data: receipt,
      provider: receipt.meta.source,
    });
  } catch (error) {
    console.error('Error parsing receipt:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse receipt',
    });
  }
});

/**
 * GET /receipts/providers - Get list of available receipt parsing providers
 */
router.get<{}, ProvidersResponse>('/providers', (req, res) => {
  try {
    const providers = getAvailableProviders();
    res.json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({
      success: true,
      providers: [],
    });
  }
});

/**
 * GET /receipts - Test endpoint (deprecated, use POST /receipts/parse instead)
 */
router.get('/', async (req, res) => {
  res.json({
    message: 'Use POST /receipts/parse to parse receipt images',
    endpoints: {
      parse: 'POST /receipts/parse - Parse a receipt image',
      providers: 'GET /receipts/providers - List available providers',
    },
  });
});

export default router;
