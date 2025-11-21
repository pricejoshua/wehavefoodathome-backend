import { Request, Response } from 'express';
import supabase from '../utils/supabase';
import { TablesInsert } from '../types/db.types';

// Helper function to get user ID from JWT token
const getUserId = (req: Request): string | null => {
  if (!req.user || typeof req.user === 'string') {
    return null;
  }
  return req.user.sub || null;
};

// Helper function to check if a user is a member of a house
const isHouseMember = async (userId: string, houseId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('user_houses')
    .select('user_id')
    .eq('user_id', userId)
    .eq('house_id', houseId)
    .single();

  return !!data;
};

// Get all food items for a house
export const getFoodItems = async (req: Request, res: Response): Promise<Response> => {
  const { house_id } = req.query;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!house_id) {
    return res.status(400).json({ error: 'house_id is required' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, house_id as string);
  if (!isMember) {
    return res.status(403).json({ error: "You do not have permission to access this house's food items" });
  }

  const { data, error } = await supabase
    .from('food_item')
    .select(`
            *,
            products (
                id,
                name,
                description,
                category,
                metadata
            )
        `)
    .eq('house_id', house_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

// Get a single food item by ID
export const getFoodItem = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('food_item')
    .select(`
            *,
            products (
                id,
                name,
                description,
                category,
                metadata
            )
        `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Food item not found' });
    }
    return res.status(500).json({ error: error.message });
  }

  // Check if user is a member of the house this food item belongs to
  const isMember = await isHouseMember(userId, data.house_id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to access this food item' });
  }

  return res.status(200).json(data);
};

// Add a new food item to a house
export const createFoodItem = async (req: Request, res: Response): Promise<Response> => {
  const foodItem = req.body as TablesInsert<'food_item'>;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate required fields
  if (!foodItem.house_id || !foodItem.product_id) {
    return res.status(400).json({
      error: 'house_id and product_id are required',
    });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, foodItem.house_id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to add items to this house' });
  }

  const { data, error } = await supabase
    .from('food_item')
    .insert(foodItem)
    .select(`
            *,
            products (
                id,
                name,
                description,
                category,
                metadata
            )
        `);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Log the addition in food_log
  if (data && data.length > 0) {
    await supabase.from('food_log').insert({
      food_id: data[0].id,
      house_id: foodItem.house_id,
      user_id: foodItem.user_id || null,
      action_type: 'added',
      quantity: foodItem.quantity || null,
      unit: foodItem.unit || null,
      notes: 'Item added to house',
    });
  }

  return res.status(201).json(data);
};

// Update a food item
export const updateFoodItem = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updates = req.body;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // First get the food item to check house membership
  const { data: foodItem } = await supabase
    .from('food_item')
    .select('house_id')
    .eq('id', id)
    .single();

  if (!foodItem) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, foodItem.house_id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to update this food item' });
  }

  const { data, error } = await supabase
    .from('food_item')
    .update(updates)
    .eq('id', id)
    .select(`
            *,
            products (
                id,
                name,
                description,
                category,
                metadata
            )
        `);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  // Log the update in food_log
  await supabase.from('food_log').insert({
    food_id: id,
    house_id: data[0].house_id,
    user_id: updates.user_id || null,
    action_type: 'updated',
    quantity: updates.quantity || null,
    unit: updates.unit || null,
    notes: 'Item updated',
  });

  return res.status(200).json(data[0]);
};

// Delete a food item (when consumed/removed)
export const deleteFoodItem = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // First get the food item to log it
  const { data: foodItem } = await supabase
    .from('food_item')
    .select('*')
    .eq('id', id)
    .single();

  if (!foodItem) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, foodItem.house_id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to delete this food item' });
  }

  // Log the deletion in food_log
  await supabase.from('food_log').insert({
    food_id: id,
    house_id: foodItem.house_id,
    user_id: foodItem.user_id || null,
    action_type: 'removed',
    quantity: foodItem.quantity || null,
    unit: foodItem.unit || null,
    notes: 'Item removed from house',
  });

  const { error } = await supabase
    .from('food_item')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(204).send();
};

// Search food items by product name or barcode
export const searchFoodItems = async (req: Request, res: Response): Promise<Response> => {
  const { house_id, query } = req.query;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!house_id) {
    return res.status(400).json({ error: 'house_id is required' });
  }

  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, house_id as string);
  if (!isMember) {
    return res.status(403).json({ error: "You do not have permission to search this house's food items" });
  }

  const { data, error } = await supabase
    .from('food_item')
    .select(`
            *,
            products!inner (
                id,
                name,
                description,
                category,
                metadata
            )
        `)
    .eq('house_id', house_id)
    .ilike('products.name', `%${query}%`);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

// Get expiring food items (items expiring within X days)
export const getExpiringItems = async (req: Request, res: Response): Promise<Response> => {
  const { house_id, days = '7' } = req.query;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!house_id) {
    return res.status(400).json({ error: 'house_id is required' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, house_id as string);
  if (!isMember) {
    return res.status(403).json({ error: "You do not have permission to view this house's food items" });
  }

  const daysAhead = parseInt(days as string, 10);
  if (isNaN(daysAhead) || daysAhead < 0) {
    return res.status(400).json({ error: 'days must be a positive number' });
  }

  // Calculate the date X days from now
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('food_item')
    .select(`
            *,
            products (
                id,
                name,
                description,
                category,
                metadata
            )
        `)
    .eq('house_id', house_id)
    .or(`best_by_date.lte.${futureDateStr},expiration_date.lte.${futureDateStr}`)
    .order('best_by_date', { ascending: true, nullsFirst: false })
    .order('expiration_date', { ascending: true, nullsFirst: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Add days_until_expiration for each item
  // Note: Using 'any' to access expiration fields that will be added via migration
  const enrichedData = data?.map((item: any) => {
    let daysUntil = null;
    let expirationDate = null;

    if (item.expiration_date) {
      expirationDate = new Date(item.expiration_date);
      daysUntil = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    } else if (item.best_by_date) {
      expirationDate = new Date(item.best_by_date);
      daysUntil = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }

    return {
      ...item,
      days_until_expiration: daysUntil,
      is_expired: daysUntil !== null && daysUntil < 0,
    };
  });

  return res.status(200).json(enrichedData);
};

// Bulk create food items
export const bulkCreateFoodItems = async (req: Request, res: Response): Promise<Response> => {
  const items = req.body.items as TablesInsert<'food_item'>[];
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'items array is required and must not be empty',
    });
  }

  // Validate all items have required fields
  for (const item of items) {
    if (!item.house_id || !item.product_id) {
      return res.status(400).json({
        error: 'All items must have house_id and product_id',
      });
    }
  }

  // Check all items belong to the same house (for simplicity)
  const houseIds = [...new Set(items.map(item => item.house_id))];
  if (houseIds.length > 1) {
    return res.status(400).json({
      error: 'All items must belong to the same house for bulk creation',
    });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, houseIds[0]);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to add items to this house' });
  }

  const { data, error } = await supabase
    .from('food_item')
    .insert(items)
    .select(`
            *,
            products (
                id,
                name,
                description,
                category,
                metadata
            )
        `);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Log bulk addition in food_log
  if (data && data.length > 0) {
    const logEntries = data.map(item => ({
      food_id: item.id,
      house_id: item.house_id,
      user_id: item.user_id || null,
      action_type: 'added',
      quantity: item.quantity || null,
      unit: item.unit || null,
      notes: 'Item added via bulk import',
    }));

    await supabase.from('food_log').insert(logEntries);
  }

  return res.status(201).json({
    count: data?.length || 0,
    items: data,
  });
};
