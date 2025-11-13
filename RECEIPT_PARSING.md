# Receipt Parsing

This application supports receipt parsing using multiple vision AI providers. You can choose from Claude Vision (Anthropic), Groq Llama Vision, or Veryfi depending on your needs.

## Supported Providers

### 1. Claude Vision (Anthropic) - Recommended
- **Model**: Claude 3.5 Sonnet (default) or other Claude models
- **Pros**: Highest accuracy, excellent at understanding complex receipts
- **Cons**: Higher cost per request
- **Use case**: Production environments where accuracy is critical

### 2. Groq Llama Vision - Fast & Cost-Effective
- **Model**: Llama 3.2 90B Vision (default)
- **Pros**: Very fast inference, lower cost, good accuracy
- **Cons**: May be less accurate on complex receipts
- **Use case**: High-volume processing, development/testing

### 3. Veryfi - Specialized OCR
- **Service**: Veryfi OCR API
- **Pros**: Specialized for receipt/invoice processing, very detailed output
- **Cons**: Requires separate Veryfi account, additional cost
- **Use case**: When you need specialized receipt features (tax breakdown, vendor info)

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Choose your default provider (optional - will auto-detect if not set)
RECEIPT_PARSER_PROVIDER=claude  # Options: claude, groq, veryfi

# Claude Vision (Anthropic)
ANTHROPIC_API_KEY=sk-ant-xxxxx
CLAUDE_MODEL=claude-3-5-sonnet-20241022  # Optional, uses default if not set

# Groq (Llama Vision)
GROQ_API_KEY=gsk_xxxxx
GROQ_MODEL=llama-3.2-90b-vision-preview  # Optional, uses default if not set

# Veryfi
VERYFI_CLIENT_ID=your_client_id
VERYFI_CLIENT_SECRET=your_client_secret
VERYFI_USERNAME=your_username
VERYFI_API_KEY=your_api_key
```

### Getting API Keys

**Claude (Anthropic):**
1. Sign up at https://console.anthropic.com
2. Create an API key from the dashboard
3. Add credits to your account

**Groq:**
1. Sign up at https://console.groq.com
2. Create an API key from the dashboard
3. Currently offers generous free tier

**Veryfi:**
1. Sign up at https://www.veryfi.com
2. Get your credentials from the dashboard
3. Note: Paid service with free trial

## API Usage

### 1. Parse a Receipt

**Endpoint:** `POST /api/v1/receipts/parse`

**Request Body:**
```json
{
  "imageUrl": "https://example.com/receipt.jpg",
  "mimeType": "image/jpeg",  // Optional: image/jpeg, image/png, etc.
  "provider": "claude"        // Optional: claude, groq, or veryfi
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/receipts/parse \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/receipt.jpg",
    "provider": "claude"
  }'
```

**Response:**
```json
{
  "success": true,
  "provider": "claude-vision",
  "data": {
    "vendor": {
      "name": "Walmart",
      "address": "123 Main St, City, State 12345"
    },
    "date": "2024-01-15T00:00:00.000Z",
    "total": 45.67,
    "subtotal": 42.50,
    "tax": 3.17,
    "currency_code": "USD",
    "line_items": [
      {
        "description": "Milk - 1 Gallon",
        "quantity": 1,
        "price": 3.99,
        "total": 3.99,
        "type": "food"
      },
      {
        "description": "Bread",
        "quantity": 2,
        "price": 2.50,
        "total": 5.00,
        "type": "food"
      }
    ]
  }
}
```

### 2. List Available Providers

**Endpoint:** `GET /api/v1/receipts/providers`

Returns a list of providers that have valid API keys configured.

**Example:**
```bash
curl http://localhost:5000/api/v1/receipts/providers
```

**Response:**
```json
{
  "success": true,
  "providers": ["claude", "groq"]
}
```

## Programmatic Usage

You can also use the receipt parsing service directly in your code:

```typescript
import { ReceiptParsingService } from './services/ReceiptParsingService';
import { ReceiptParserProvider } from './types/ReceiptParser';

// Use default provider (from env or auto-detect)
const service = new ReceiptParsingService();
const receipt = await service.parseReceipt(imageUrl);

// Use specific provider
const claudeService = ReceiptParsingService.withProvider(ReceiptParserProvider.CLAUDE);
const receipt = await claudeService.parseReceipt(imageUrl);

// Get available providers
const providers = ReceiptParsingService.getAvailableProviders();
console.log('Available providers:', providers);
```

## Provider Selection Logic

If you don't specify a provider, the system will auto-select based on this priority:

1. Check `RECEIPT_PARSER_PROVIDER` environment variable
2. If not set, check for API keys in this order:
   - Claude (`ANTHROPIC_API_KEY`)
   - Groq (`GROQ_API_KEY`)
   - Veryfi (`VERYFI_API_KEY` + other Veryfi credentials)

## Response Format

All providers return data in a standardized format (the `Reciept` type):

```typescript
{
  vendor: {
    name: string
    address: string | null
    phone_number: string | null
  }
  date: Date | null
  total: number
  subtotal: number
  tax: number | null
  currency_code: string
  line_items: [
    {
      description: string
      quantity: number
      price: number | null
      total: number | null
      type: "food" | "product" | "alcohol" | "discount" | "fee" | null
    }
  ]
  payment: {
    type: string | null
  }
  meta: {
    source: string  // Provider identifier
    ocr_score: number
  }
}
```

## Error Handling

The API returns appropriate error messages:

```json
{
  "success": false,
  "error": "Failed to parse receipt with Claude: Invalid API key"
}
```

Common errors:
- `imageUrl is required` - Missing image URL in request
- `Invalid provider` - Provider not recognized
- `No receipt parser API keys configured` - No valid API keys found
- `Failed to download image` - Image URL is invalid or inaccessible
- Provider-specific errors (invalid API key, rate limits, etc.)

## Tips for Best Results

1. **Image Quality**: Higher resolution images (300 DPI+) work better
2. **Image Format**: JPEG and PNG are supported by all providers
3. **Lighting**: Ensure receipts are well-lit and not blurry
4. **Orientation**: Receipts should be upright (not rotated)
5. **Provider Selection**:
   - Use Claude for important receipts or complex layouts
   - Use Groq for batch processing or when speed matters
   - Use Veryfi when you need specialized receipt features

## Testing

You can test with sample receipt URLs:

```bash
# Test with Claude
curl -X POST http://localhost:5000/api/v1/receipts/parse \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/sample-receipt.jpg",
    "provider": "claude"
  }'

# Test with Groq
curl -X POST http://localhost:5000/api/v1/receipts/parse \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/sample-receipt.jpg",
    "provider": "groq"
  }'
```

## Architecture

```
┌─────────────────┐
│  API Endpoint   │
│  /receipts/parse│
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ReceiptParsingService│ (Unified Interface)
└────────┬────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│Claude Parser │ │Groq Parser   │ │Veryfi Parser │  │
└──────────────┘ └──────────────┘ └──────────────┘  │
         │              │              │              │
         ▼              ▼              ▼              │
   Anthropic API   Groq API      Veryfi API          │
                                                      ▼
                                             ┌────────────────┐
                                             │  Reciept Type  │
                                             └────────────────┘
```

## Support

For issues or questions:
- Check the logs for detailed error messages
- Verify your API keys are correct
- Ensure the image URL is publicly accessible
- Try different providers to compare results
