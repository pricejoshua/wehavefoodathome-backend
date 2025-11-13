-- Migration: Add food tagging system
-- Run this in your Supabase SQL Editor

-- Create food_tags table (many-to-many relationship between food_item and profiles)
CREATE TABLE IF NOT EXISTS food_tags (
    food_id UUID NOT NULL REFERENCES food_item(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (food_id, user_id)
);

-- Add comment for documentation
COMMENT ON TABLE food_tags IS 'Tags food items as belonging to specific users. NULL user_id means "for everyone"';
COMMENT ON COLUMN food_tags.user_id IS 'User this food belongs to. NULL = available for all';

-- Create index for efficient querying
CREATE INDEX idx_food_tags_food_id ON food_tags(food_id);
CREATE INDEX idx_food_tags_user_id ON food_tags(user_id) WHERE user_id IS NOT NULL;

-- Create view for easily querying tagged food items
CREATE OR REPLACE VIEW food_items_with_tags AS
SELECT
    fi.*,
    p.name as product_name,
    p.description as product_description,
    COALESCE(
        json_agg(
            json_build_object(
                'user_id', ft.user_id,
                'username', prof.username,
                'full_name', prof.full_name
            )
        ) FILTER (WHERE ft.user_id IS NOT NULL),
        '[]'::json
    ) as tagged_users,
    EXISTS(SELECT 1 FROM food_tags WHERE food_id = fi.id AND user_id IS NULL) as available_for_all
FROM food_item fi
LEFT JOIN products p ON fi.product_id = p.id
LEFT JOIN food_tags ft ON fi.id = ft.food_id
LEFT JOIN profiles prof ON ft.user_id = prof.id
GROUP BY fi.id, p.name, p.description;

-- Grant access to the tables and views
GRANT SELECT, INSERT, DELETE ON food_tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON food_tags TO service_role;
GRANT SELECT ON food_items_with_tags TO authenticated;
GRANT SELECT ON food_items_with_tags TO service_role;
