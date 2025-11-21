Food Tracker
This is to solve the problem of people in my house buying things that we have already...

Express/NodeJS + Supabase backend

[React frontend](https://github.com/pricejoshua/wehavefoodathome-frontend)

Planning on this to be an android/ios app.

Backend for the food tracker app

## Receipt Parsing

The app now supports automatic receipt parsing using multiple AI vision providers! Upload a receipt image and get structured data about items, prices, vendors, and more.

**Supported Providers:**
- **Claude Vision (Anthropic)** - Highest accuracy, recommended for production
- **Groq Llama Vision** - Fast and cost-effective, great for high-volume processing
- **Veryfi** - Specialized OCR service for receipts and invoices

See [RECEIPT_PARSING.md](./RECEIPT_PARSING.md) for detailed documentation on setup and usage.

### Quick Start

1. Add your API keys to `.env`:
```bash
# Choose one or more providers
ANTHROPIC_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
VERYFI_API_KEY=your_key_here
```

2. Parse a receipt:
```bash
POST /api/v1/receipts/parse
{
  "imageUrl": "https://example.com/receipt.jpg",
  "provider": "claude"  // optional: claude, groq, or veryfi
}
```

### Key Features
- [x] **Receipt capture for bulk input** - Supports Claude Vision, Groq Llama Vision, and Veryfi
- [ ] Barcode Scanner
- [ ] Best by date capturing
- [ ] Alert when best by date approaches
- [ ] Ability to delete food when you finish it (preferably by barcode)
- [ ] Account creation
- [ ] Grouping of accounts as a "house"

### Backlog
- [ ] Recipe Lookup
- [ ] Database of how long produce lasts
- [ ] Tagging food as "someone's"
- [ ] Image recognition for "checking-in/out" food
