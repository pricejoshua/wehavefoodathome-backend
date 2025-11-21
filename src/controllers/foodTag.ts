import { Request, Response } from 'express';
import supabase from '../utils/supabase';

/**
 * Tag a food item for a specific user
 * POST body: { food_id, user_id }
 * If user_id is null or "all", tags item as available for everyone
 */
export const tagFoodItem = async (req: Request, res: Response): Promise<Response> => {
  const { food_id, user_id } = req.body;

  if (!food_id) {
    return res.status(400).json({ error: 'food_id is required' });
  }

  // Handle "all" keyword
  const finalUserId = (user_id === 'all' || user_id === null) ? null : user_id;

  // Check if tag already exists
  // Note: Using 'any' for food_tags table until migration is run
  let query = (supabase as any)
    .from('food_tags')
    .select('*')
    .eq('food_id', food_id);

  if (finalUserId === null) {
    query = query.is('user_id', null);
  } else {
    query = query.eq('user_id', finalUserId);
  }

  const { data: existing } = await query.single();

  if (existing) {
    return res.status(409).json({
      error: 'Food item is already tagged for this user',
    });
  }

  // Create the tag
  const { data, error } = await (supabase as any)
    .from('food_tags')
    .insert({ food_id, user_id: finalUserId })
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
};

/**
 * Remove a tag from a food item
 * DELETE body: { food_id, user_id }
 */
export const untagFoodItem = async (req: Request, res: Response): Promise<Response> => {
  const { food_id, user_id } = req.body;

  if (!food_id) {
    return res.status(400).json({ error: 'food_id is required' });
  }

  const finalUserId = (user_id === 'all' || user_id === null) ? null : user_id;

  // Note: Using 'any' for food_tags table until migration is run
  let query = (supabase as any)
    .from('food_tags')
    .delete()
    .eq('food_id', food_id);

  if (finalUserId === null) {
    query = query.is('user_id', null);
  } else {
    query = query.eq('user_id', finalUserId);
  }

  const { error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(204).send();
};

/**
 * Get all tags for a food item
 */
export const getFoodItemTags = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  // Note: Using 'any' for food_tags table until migration is run
  const { data, error } = await (supabase as any)
    .from('food_tags')
    .select(`
            *,
            profiles (
                id,
                username,
                full_name,
                avatar_url
            )
        `)
    .eq('food_id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Separate "for all" tags from user-specific tags
  const forAll = data.filter((tag: any) => tag.user_id === null).length > 0;
  const users = data
    .filter((tag: any) => tag.user_id !== null)
    .map((tag: any) => tag.profiles);

  return res.status(200).json({
    food_id: id,
    available_for_all: forAll,
    tagged_users: users,
  });
};

/**
 * Get food items tagged for a specific user (or "all")
 */
export const getTaggedFoodItems = async (req: Request, res: Response): Promise<Response> => {
  const { house_id, user_id } = req.query;

  if (!house_id) {
    return res.status(400).json({ error: 'house_id is required' });
  }

  // Get food items that are either:
  // 1. Tagged for this specific user
  // 2. Tagged as "for all" (user_id is null)
  // 3. Not tagged at all (considered available for all)

  let query = supabase
    .from('food_item')
    .select(`
            *,
            products (
                id,
                name,
                description,
                category,
                metadata
            ),
            food_tags (
                user_id,
                profiles (
                    id,
                    username,
                    full_name
                )
            )
        `)
    .eq('house_id', house_id);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Filter results based on user_id
  const filteredData = data?.filter((item: any) => {
    const tags = item.food_tags || [];

    // If no tags, it's available for all
    if (tags.length === 0) {
      return true;
    }

    // Check if tagged for "all"
    const hasAllTag = tags.some((tag: any) => tag.user_id === null);
    if (hasAllTag) {
      return true;
    }

    // Check if tagged for specific user
    if (user_id) {
      const hasUserTag = tags.some((tag: any) => tag.user_id === user_id);
      if (hasUserTag) {
        return true;
      }
    }

    return false;
  });

  return res.status(200).json(filteredData);
};

/**
 * Bulk tag multiple food items
 * POST body: { food_ids: string[], user_id: string | null | "all" }
 */
export const bulkTagFoodItems = async (req: Request, res: Response): Promise<Response> => {
  const { food_ids, user_id } = req.body;

  if (!Array.isArray(food_ids) || food_ids.length === 0) {
    return res.status(400).json({
      error: 'food_ids array is required and must not be empty',
    });
  }

  const finalUserId = (user_id === 'all' || user_id === null) ? null : user_id;

  const tags = food_ids.map(food_id => ({
    food_id,
    user_id: finalUserId,
  }));

  // Note: Using 'any' for food_tags table until migration is run
  const { data, error } = await (supabase as any)
    .from('food_tags')
    .insert(tags)
    .select();

  if (error) {
    // Handle unique constraint violations gracefully
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Some food items are already tagged for this user',
      });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({
    count: data?.length || 0,
    tags: data,
  });
};
