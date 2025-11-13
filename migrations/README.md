# Database Migrations

This directory contains SQL migration files for the Supabase database.

## How to Run Migrations

### 1. Apply Migration in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file (e.g., `add_expiration_dates.sql`)
4. Copy and paste the SQL into the editor
5. Click **Run** to execute

### 2. Regenerate TypeScript Types

After running any migration that changes table structures, regenerate the TypeScript types:

```bash
cd /home/user/wehavefoodathome-backend
./gentypes.sh
```

This will update `src/types/db.types.ts` with the latest schema from Supabase.

### 3. Rebuild the Project

```bash
npm run build
```

## Available Migrations

### `add_expiration_dates.sql`
- Adds `best_by_date` and `expiration_date` columns to `food_item` table
- Creates indexes for efficient querying
- Creates `expiring_food_items` view for easy access to items nearing expiration

**What it does:**
- `best_by_date`: Quality may degrade after this date (optional)
- `expiration_date`: Hard expiration - should not consume after (optional)
- View calculates `days_until_expiration` automatically
- Indexes ensure fast queries for expiring items alerts

**After running:** You'll be able to:
- Set expiration dates when adding food items
- Query items expiring within X days
- Get alerts for food nearing expiration

### `add_food_tags.sql`
- Creates `food_tags` table for tagging food items as belonging to specific users
- Creates `food_items_with_tags` view for querying tagged items
- Adds indexes for efficient tag lookups

**What it does:**
- Tag food items for specific users ("John's milk")
- Tag items as "for everyone" by setting user_id to NULL
- Support for bulk tagging operations
- View aggregates all tags for each food item

**After running:** You'll be able to:
- Tag food items: "This is mine" vs "This is for everyone"
- Filter food list by tagged user
- Bulk tag items from receipts
- See who owns what food
