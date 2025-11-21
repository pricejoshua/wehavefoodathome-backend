# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Table of Contents
- [Receipt Parsing](#receipt-parsing)
- [Products](#products)
- [Items](#items)
- [Upload](#upload)
- [Emojis](#emojis)

---

## Receipt Parsing

### Parse Receipt

Parse a receipt image using AI vision models.

**Endpoint:** `POST /receipts/parse`

**Request Body:**
```json
{
  "imageUrl": "https://example.com/receipt.jpg",
  "mimeType": "image/jpeg",  // Optional: image/jpeg, image/png, image/gif, image/webp
  "provider": "claude"        // Optional: claude, groq, or veryfi
}
```

**Parameters:**
- `imageUrl` (string, required) - URL of the receipt image to parse
- `mimeType` (string, optional) - MIME type of the image. Defaults to `image/jpeg`
- `provider` (string, optional) - Which provider to use. Options: `claude`, `groq`, `veryfi`. If not specified, will use the default provider from environment config or auto-detect based on available API keys.

**Success Response (200 OK):**
```json
{
  "success": true,
  "provider": "claude-vision",
  "data": {
    "id": 0,
    "vendor": {
      "name": "Walmart",
      "raw_name": "Walmart",
      "address": "123 Main St, City, State 12345",
      "phone_number": "555-1234",
      "logo": "",
      "category": null,
      "lat": null,
      "lng": null
    },
    "date": "2024-01-15T00:00:00.000Z",
    "total": 45.67,
    "subtotal": 42.50,
    "tax": 3.17,
    "currency_code": "USD",
    "line_items": [
      {
        "id": 1,
        "order": 0,
        "text": "Milk - 1 Gallon",
        "description": "Milk - 1 Gallon",
        "normalized_description": "milk - 1 gallon",
        "quantity": 1,
        "price": 3.99,
        "total": 3.99,
        "type": "food",
        "sku": null,
        "upc": null,
        "tax": null
      },
      {
        "id": 2,
        "order": 1,
        "text": "Bread",
        "description": "Bread",
        "normalized_description": "bread",
        "quantity": 2,
        "price": 2.50,
        "total": 5.00,
        "type": "food",
        "sku": null,
        "upc": null,
        "tax": null
      }
    ],
    "payment": {
      "type": "Card",
      "card_number": null,
      "display_name": null,
      "terms": null
    },
    "meta": {
      "language": ["en"],
      "ocr_score": 0.95,
      "owner": "claude",
      "source": "claude-vision",
      "pages": [],
      "processed_pages": 1,
      "total_pages": 1
    },
    "document_type": "receipt",
    "reference_number": "claude-1705334567890",
    "created_date": "2024-01-15T12:34:56.789Z",
    "updated_date": "2024-01-15T12:34:56.789Z"
  }
}
```

**Error Responses:**

400 Bad Request - Missing or invalid parameters:
```json
{
  "success": false,
  "error": "imageUrl is required"
}
```

```json
{
  "success": false,
  "error": "Invalid provider. Must be one of: claude, groq, veryfi"
}
```

500 Internal Server Error - Processing failed:
```json
{
  "success": false,
  "error": "Failed to parse receipt with Claude: Invalid API key"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v1/receipts/parse \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/receipt.jpg",
    "provider": "claude"
  }'
```

---

### Get Available Providers

Get a list of receipt parsing providers that have valid API keys configured.

**Endpoint:** `GET /receipts/providers`

**Success Response (200 OK):**
```json
{
  "success": true,
  "providers": ["claude", "groq"]
}
```

**Example Request:**
```bash
curl http://localhost:5000/api/v1/receipts/providers
```

---

### Get Receipts Info

Get information about the receipts API.

**Endpoint:** `GET /receipts`

**Success Response (200 OK):**
```json
{
  "message": "Use POST /receipts/parse to parse receipt images",
  "endpoints": {
    "parse": "POST /receipts/parse - Parse a receipt image",
    "providers": "GET /receipts/providers - List available providers"
  }
}
```

---

## Products

### Get Products

Retrieve all products from the database.

**Endpoint:** `GET /products`

**Success Response (200 OK):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "category": "category-id",
      "description": "Product description",
      "metadata": {},
      "created_at": "2024-01-15T12:34:56.789Z"
    }
  ]
}
```

**Example Request:**
```bash
curl http://localhost:5000/api/v1/products
```

---

### Create Product

Create a new product.

**Endpoint:** `POST /products`

**Request Body:**
```json
{
  "name": "Product Name",
  "category": "category-id",
  "description": "Product description",
  "metadata": {}
}
```

**Success Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "category": "category-id",
  "description": "Product description",
  "metadata": {},
  "created_at": "2024-01-15T12:34:56.789Z"
}
```

---

## Upload

### Upload Receipt Image

Upload a receipt image to Supabase Storage.

**Endpoint:** `POST /upload`

**Request:** Multipart form data with image file

**Form Fields:**
- `image` - The image file to upload

**Success Response (200 OK):**
```json
{
  "message": "File uploaded successfully",
  "url": "https://your-project.supabase.co/storage/v1/object/public/receipts/filename.jpg"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "No file uploaded"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v1/upload \
  -F "image=@receipt.jpg"
```

---

## Emojis

### Get Emojis

Get a list of emojis (test endpoint).

**Endpoint:** `GET /emojis`

**Success Response (200 OK):**
```json
["😀", "😃", "😄", "😁", "😆"]
```

---

## Data Types

### Receipt (`Reciept`)

```typescript
{
  id: number
  vendor: {
    name: string
    raw_name: string
    address: string | null
    phone_number: string | null
    logo: string
    category: string | null
    email: string | null
    lat: number | null
    lng: number | null
    web: string | null
    vat_number: string | null
    type: string | null
  }
  date: Date | null
  total: number
  subtotal: number
  tax: number | null
  currency_code: string
  line_items: LineItem[]
  payment: {
    type: string | null
    card_number: string | null
    display_name: string | null
    terms: null
  }
  meta: {
    language: string[]
    ocr_score: number
    owner: string
    source: string
    pages: Array
    processed_pages: number
    total_pages: number
  }
  document_type: string
  reference_number: string
  created_date: Date
  updated_date: Date
  // ... additional fields
}
```

### Line Item

```typescript
{
  id: number
  order: number
  text: string
  description: string | null
  normalized_description: string | null
  quantity: number
  price: number | null
  total: number | null
  type: "food" | "product" | "alcohol" | "discount" | "fee" | null
  sku: string | null
  upc: null
  tax: number | null
  discount: number | null
  // ... additional fields
}
```

### Product

```typescript
{
  id: string (uuid)
  name: string
  category: string (uuid)
  description: string | null
  metadata: object
  created_at: Date
}
```

---

## Authentication

Authentication is handled via Supabase JWT tokens. Protected endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <jwt-token>
```

Currently, the `/upload` endpoint and some product endpoints may require authentication. Check the middleware configuration for specific routes.

---

## Error Handling

All endpoints follow a consistent error response format:

**Success:**
```json
{
  "success": true,
  "data": {...}
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Rate limiting depends on the receipt parsing provider:

- **Claude (Anthropic):** Varies by plan, typically 1000+ requests/minute
- **Groq:** Varies by plan, typically very high rate limits
- **Veryfi:** Varies by plan, check Veryfi documentation

For production use, implement appropriate rate limiting on your server to prevent abuse.

---

## Examples

### Complete Receipt Parsing Flow

1. Upload image to storage:
```bash
curl -X POST http://localhost:5000/api/v1/upload \
  -F "image=@receipt.jpg"
```

Response:
```json
{
  "message": "File uploaded successfully",
  "url": "https://your-project.supabase.co/storage/v1/object/public/receipts/receipt-123.jpg"
}
```

2. Parse the uploaded receipt:
```bash
curl -X POST http://localhost:5000/api/v1/receipts/parse \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://your-project.supabase.co/storage/v1/object/public/receipts/receipt-123.jpg",
    "provider": "claude"
  }'
```

3. Process the line items to add to inventory (custom logic needed).

---

## Environment Variables

Required environment variables for the API:

```bash
# Node
NODE_ENV=development
PORT=5000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Receipt Parsing - Choose at least one provider
RECEIPT_PARSER_PROVIDER=claude  # Optional: claude, groq, or veryfi

# Claude Vision (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key
CLAUDE_MODEL=claude-3-5-sonnet-20241022  # Optional

# Groq (Llama Vision)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.2-90b-vision-preview  # Optional

# Veryfi
VERYFI_CLIENT_ID=your_client_id
VERYFI_CLIENT_SECRET=your_client_secret
VERYFI_USERNAME=your_username
VERYFI_API_KEY=your_api_key
```

See `.env.sample` for a complete list of environment variables.
