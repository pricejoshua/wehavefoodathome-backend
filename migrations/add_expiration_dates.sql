-- Migration: Add expiration date tracking to food_item table
-- Run this in your Supabase SQL Editor

-- Add best_by_date and expiration_date columns to food_item
ALTER TABLE food_item
ADD COLUMN best_by_date DATE,
ADD COLUMN expiration_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN food_item.best_by_date IS 'Best by/use by date - quality may degrade after this date';
COMMENT ON COLUMN food_item.expiration_date IS 'Hard expiration date - should not consume after this date';

-- Create index for efficient querying of expiring items
CREATE INDEX idx_food_item_best_by_date ON food_item(best_by_date) WHERE best_by_date IS NOT NULL;
CREATE INDEX idx_food_item_expiration_date ON food_item(expiration_date) WHERE expiration_date IS NOT NULL;

-- Optional: Create a view for easily finding expiring items
CREATE OR REPLACE VIEW expiring_food_items AS
SELECT
    fi.*,
    p.name as product_name,
    p.description as product_description,
    CASE
        WHEN fi.expiration_date IS NOT NULL THEN fi.expiration_date::date - CURRENT_DATE
        WHEN fi.best_by_date IS NOT NULL THEN fi.best_by_date::date - CURRENT_DATE
        ELSE NULL
    END as days_until_expiration
FROM food_item fi
LEFT JOIN products p ON fi.product_id = p.id
WHERE
    (fi.expiration_date IS NOT NULL AND fi.expiration_date >= CURRENT_DATE)
    OR (fi.best_by_date IS NOT NULL AND fi.best_by_date >= CURRENT_DATE)
ORDER BY
    CASE
        WHEN fi.expiration_date IS NOT NULL THEN fi.expiration_date
        WHEN fi.best_by_date IS NOT NULL THEN fi.best_by_date
    END ASC;

-- Grant access to the view (adjust role as needed)
GRANT SELECT ON expiring_food_items TO authenticated;
GRANT SELECT ON expiring_food_items TO service_role;
