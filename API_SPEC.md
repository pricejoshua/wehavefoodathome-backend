# WeHaveFoodAtHome API Specification

**Base URL:** `http://localhost:5000/api/v1`

**Version:** 1.0.0

## Table of Contents
- [Authentication](#authentication)
- [Products](#products)
- [Food Items](#food-items)
- [Houses](#houses)
- [Profiles](#profiles)
- [Receipts](#receipts)
- [Database Migrations Required](#database-migrations-required)

---

## Authentication

Most endpoints require authentication via Supabase JWT token.

**Header:**
```
Authorization: Bearer <supabase_jwt_token>
```

**Public Endpoints (No Auth Required):**
- `POST /profiles` - User registration
- All `GET /products/*` endpoints
- `POST /products/barcode/:barcode/lookup` - Barcode lookup

---

## Products

### List All Products
```
GET /products
```
**Auth:** Public

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Coca-Cola Classic",
    "description": "Brand: Coca-Cola | Categories: Beverages",
    "category": 123,
    "metadata": {
      "barcode": "0049000042566",
      "nutriscore_grade": "d",
      "ingredients": "..."
    },
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

### Search Products
```
GET /products/search?query=milk
```
**Auth:** Public

**Query Params:**
- `query` (required) - Search term

### Get Product by Barcode
```
GET /products/barcode/:barcode
```
**Auth:** Public

**Returns:** Single product or 404

### Lookup & Auto-Create from Barcode
```
POST /products/barcode/:barcode/lookup
```
**Auth:** Public

**Request Body (optional - for manual creation if not in Open Food Facts):**
```json
{
  "name": "Product Name",
  "description": "Optional description",
  "category": 123,
  "metadata": {}
}
```

**Response:**
```json
{
  "product": {
    "id": "uuid",
    "name": "Product Name",
    "metadata": {
      "barcode": "123456789",
      "source": "openfoodfacts"
    }
  },
  "source": "openfoodfacts",  // or "database" or "manual"
  "created": true,
  "message": "Product automatically created from Open Food Facts"
}
```

### Create Product
```
POST /products
```
**Auth:** Public

**Request:**
```json
{
  "name": "Product Name",
  "description": "Optional",
  "category": 123,
  "metadata": {
    "barcode": "123456789"
  }
}
```

### Update Product
```
PUT /products/:id
```
**Auth:** Required ⚠️

### Delete Product
```
DELETE /products/:id
```
**Auth:** Required ⚠️

---

## Food Items

All food item endpoints require authentication.

### List Food Items in House
```
GET /food-items?house_id=xxx
```
**Auth:** Required

**Query Params:**
- `house_id` (required) - UUID of house

**Response:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "house_id": "uuid",
    "user_id": "uuid",
    "quantity": 2,
    "unit": "count",
    "best_by_date": "2025-12-15",
    "expiration_date": null,
    "created_at": "2025-01-15T10:00:00Z",
    "products": {
      "id": "uuid",
      "name": "Milk",
      "description": "Whole milk"
    }
  }
]
```

### Get Single Food Item
```
GET /food-items/:id
```
**Auth:** Required

### Search Food Items
```
GET /food-items/search?house_id=xxx&query=milk
```
**Auth:** Required

### Get Expiring Items
```
GET /food-items/expiring?house_id=xxx&days=7
```
**Auth:** Required

**Query Params:**
- `house_id` (required)
- `days` (optional, default: 7) - Number of days ahead

**Response:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "best_by_date": "2025-12-01",
    "days_until_expiration": 3,
    "is_expired": false,
    "products": {
      "name": "Milk"
    }
  }
]
```

### Get Tagged Food Items
```
GET /food-items/tagged?house_id=xxx&user_id=xxx
```
**Auth:** Required

**Query Params:**
- `house_id` (required)
- `user_id` (optional) - Filter by tagged user

**Returns:** Items tagged for that user + items tagged "for all" + untagged items

### Get House Activity Log
```
GET /food-items/activity?house_id=xxx&limit=50&action_type=added
```
**Auth:** Required

**Query Params:**
- `house_id` (required)
- `limit` (optional, default: 50, max: 1000)
- `action_type` (optional) - Filter: "added", "removed", "updated"

**Response:**
```json
[
  {
    "id": 123,
    "food_id": "uuid",
    "house_id": "uuid",
    "user_id": "uuid",
    "action_type": "added",
    "quantity": 2,
    "timestamp": "2025-01-15T10:00:00Z",
    "notes": "Item added to house",
    "food_item": {
      "id": "uuid",
      "products": {
        "name": "Milk"
      }
    },
    "profiles": {
      "username": "john",
      "full_name": "John Doe"
    }
  }
]
```

### Get Activity Summary
```
GET /food-items/activity/summary?house_id=xxx&days=30
```
**Auth:** Required

**Response:**
```json
{
  "house_id": "uuid",
  "period_days": 30,
  "total_actions": 156,
  "by_action_type": {
    "added": 89,
    "removed": 45,
    "updated": 22
  }
}
```

### Add Food Item
```
POST /food-items
```
**Auth:** Required

**Request:**
```json
{
  "house_id": "uuid",
  "product_id": "uuid",
  "user_id": "uuid",
  "quantity": 2,
  "unit": "count",
  "best_by_date": "2025-12-15",
  "expiration_date": "2025-12-20"
}
```

### Bulk Create Food Items
```
POST /food-items/bulk
```
**Auth:** Required

**Request:**
```json
{
  "items": [
    {
      "house_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "unit": "count",
      "best_by_date": "2025-12-15"
    },
    {
      "house_id": "uuid",
      "product_id": "uuid2",
      "quantity": 1,
      "unit": "liter"
    }
  ]
}
```

**Response:**
```json
{
  "count": 2,
  "items": [ /* created items */ ]
}
```

### Update Food Item
```
PUT /food-items/:id
```
**Auth:** Required

### Delete Food Item
```
DELETE /food-items/:id
```
**Auth:** Required

### Get Food Item History
```
GET /food-items/:id/history
```
**Auth:** Required

**Response:** Array of activity log entries for this item

---

## Food Tagging

### Tag Food Item
```
POST /food-items/tags
```
**Auth:** Required

**Request:**
```json
{
  "food_id": "uuid",
  "user_id": "uuid"  // or "all" or null for "everyone"
}
```

### Remove Tag
```
DELETE /food-items/tags
```
**Auth:** Required

**Request:**
```json
{
  "food_id": "uuid",
  "user_id": "uuid"  // or "all" or null
}
```

### Get Tags for Food Item
```
GET /food-items/:id/tags
```
**Auth:** Required

**Response:**
```json
{
  "food_id": "uuid",
  "available_for_all": false,
  "tagged_users": [
    {
      "id": "uuid",
      "username": "john",
      "full_name": "John Doe",
      "avatar_url": "..."
    }
  ]
}
```

### Bulk Tag Food Items
```
POST /food-items/tags/bulk
```
**Auth:** Required

**Request:**
```json
{
  "food_ids": ["uuid1", "uuid2", "uuid3"],
  "user_id": "uuid"  // or "all" or null
}
```

**Response:**
```json
{
  "count": 3,
  "tags": [ /* created tags */ ]
}
```

---

## Houses

All house endpoints require authentication.

### Get User's Houses
```
GET /houses?user_id=xxx
```
**Auth:** Required

**Response:**
```json
[
  {
    "house_id": "uuid",
    "created_at": "2025-01-15T10:00:00Z",
    "houses": {
      "id": "uuid",
      "name": "Family Home",
      "description": "Main house",
      "created_at": "2025-01-15T10:00:00Z"
    }
  }
]
```

### Get House Details
```
GET /houses/:id
```
**Auth:** Required

### Get House Members
```
GET /houses/:id/members
```
**Auth:** Required

**Response:**
```json
[
  {
    "user_id": "uuid",
    "created_at": "2025-01-15T10:00:00Z",
    "profiles": {
      "id": "uuid",
      "username": "john",
      "full_name": "John Doe",
      "avatar_url": "..."
    }
  }
]
```

### Create House
```
POST /houses
```
**Auth:** Required

**Request:**
```json
{
  "name": "Family Home",
  "description": "Main house"
}
```

### Update House
```
PUT /houses/:id
```
**Auth:** Required

### Delete House
```
DELETE /houses/:id
```
**Auth:** Required

### Add User to House
```
POST /houses/members
```
**Auth:** Required

**Request:**
```json
{
  "house_id": "uuid",
  "user_id": "uuid"
}
```

### Remove User from House
```
DELETE /houses/members
```
**Auth:** Required

**Request:**
```json
{
  "house_id": "uuid",
  "user_id": "uuid"
}
```

---

## Profiles

### Create Profile (Registration)
```
POST /profiles
```
**Auth:** Public ✅

**Request:**
```json
{
  "id": "uuid",  // From Supabase Auth
  "username": "john",
  "full_name": "John Doe",
  "avatar_url": "...",
  "birthday": "1990-01-15",
  "website": "https://example.com"
}
```

### Get Profile by ID
```
GET /profiles/:id
```
**Auth:** Required

### Get Profile by Username
```
GET /profiles/username/:username
```
**Auth:** Required

### Search Profiles
```
GET /profiles/search?query=john
```
**Auth:** Required

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "john",
    "full_name": "John Doe",
    "avatar_url": "..."
  }
]
```

### Update Profile
```
PUT /profiles/:id
```
**Auth:** Required

### Delete Profile
```
DELETE /profiles/:id
```
**Auth:** Required

---

## Receipts

### Upload Receipt Image
```
POST /upload
```
**Auth:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` - File upload

**Response:**
```json
{
  "path": "receipts/1234567890-uuid"
}
```

### Parse Receipt (Mock Data)
```
GET /receipts
```
**Auth:** Required

⚠️ **Note:** Currently returns mock Aldi receipt data. Real parsing not yet implemented.

---

## Database Migrations Required

Before using these features, run these migrations in Supabase SQL Editor:

### 1. Expiration Dates
**File:** `migrations/add_expiration_dates.sql`

Adds:
- `best_by_date` column to `food_item`
- `expiration_date` column to `food_item`
- Indexes for fast queries
- `expiring_food_items` view

### 2. Food Tags
**File:** `migrations/add_food_tags.sql`

Adds:
- `food_tags` table
- `food_items_with_tags` view
- Indexes for tag lookups

**After running migrations:**
```bash
./gentypes.sh  # Regenerate TypeScript types
npm run build  # Rebuild project
```

---

## Environment Variables

Required in `.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROJECT_ID=your_project_id

# Veryfi (for receipt parsing - not currently active)
VERYFI_CLIENT_ID=your_client_id
VERYFI_CLIENT_SECRET=your_client_secret
VERYFI_USERNAME=your_username
VERYFI_API_KEY=your_api_key
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Rate Limiting

**Open Food Facts API:**
- Follow guideline: 1 API call = 1 real scan
- Avoid scraping/bulk lookups
- Results should be cached

---

## Validation

### UUID Format
All IDs must be valid UUIDv4 format:
```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

### Barcode Format
Barcodes must be 8-14 digits:
```
^[0-9]{8,14}$
```

### Date Format
Dates must be in ISO format:
```
YYYY-MM-DD
```

---

## Complete Feature List

✅ **Implemented:**
- Product management (CRUD)
- Barcode lookup with Open Food Facts integration
- Manual product creation fallback
- Food item management with house association
- Expiration date tracking (best by & expiration)
- Expiring items alerts
- Food activity logging
- Activity log queries and summaries
- Bulk food item creation
- Food tagging ("mine" vs "everyone")
- Bulk tagging
- Tagged item filtering
- House management
- House member management
- User profiles
- Receipt image upload
- Authentication & protected routes

⚠️ **Mocked/Incomplete:**
- Receipt parsing (returns mock data)

---

## TypeScript Types

All request/response types are available in:
- `src/types/db.types.ts` - Generated from Supabase schema
- `src/types/Receipt.ts` - Receipt data structures

---

## Testing

To test the API locally:

```bash
# Start server
npm run dev

# Example: Barcode lookup
curl -X POST http://localhost:5000/api/v1/products/barcode/0049000042566/lookup

# Example: Get expiring items (requires auth)
curl -X GET "http://localhost:5000/api/v1/food-items/expiring?house_id=uuid&days=3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration Checklist

1. **Authentication:**
   - Obtain JWT token from Supabase Auth
   - Include in `Authorization: Bearer <token>` header
   - Handle 401 responses (token expired)

2. **Run Migrations:**
   - Execute SQL files in `migrations/` directory
   - Regenerate types if needed

3. **Barcode Scanning:**
   - Scan barcode → `POST /products/barcode/:barcode/lookup`
   - If 404 → Prompt for product name → Retry with name in body
   - Use returned product to create food item

4. **Receipt Flow:**
   - Upload image → `POST /upload`
   - Parse receipt → `GET /receipts` (currently mock)
   - Bulk create items → `POST /food-items/bulk`

5. **Expiration Alerts:**
   - Fetch expiring items → `GET /food-items/expiring?house_id=xxx&days=3`
   - Show notifications for items where `days_until_expiration < threshold`

6. **Food Tagging:**
   - When adding item → Optionally `POST /food-items/tags`
   - Filter view → `GET /food-items/tagged?house_id=xxx&user_id=xxx`

---

**Last Updated:** 2025-01-15
**API Version:** 1.0.0
