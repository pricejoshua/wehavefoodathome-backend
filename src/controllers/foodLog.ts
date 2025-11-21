import { Request, Response } from 'express';
import supabase from '../utils/supabase';

// Get activity log for a specific food item
export const getFoodItemHistory = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('food_log')
    .select(`
            *,
            profiles (
                id,
                username,
                full_name
            )
        `)
    .eq('food_id', id)
    .order('timestamp', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

// Get activity log for a house
export const getHouseActivity = async (req: Request, res: Response): Promise<Response> => {
  const { house_id, limit = '50', action_type } = req.query;

  if (!house_id) {
    return res.status(400).json({ error: 'house_id is required' });
  }

  const limitNum = parseInt(limit as string, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
    return res.status(400).json({ error: 'limit must be between 1 and 1000' });
  }

  let query = supabase
    .from('food_log')
    .select(`
            *,
            food_item:food_id (
                id,
                quantity,
                unit,
                products (
                    id,
                    name,
                    description
                )
            ),
            profiles (
                id,
                username,
                full_name
            )
        `)
    .eq('house_id', house_id)
    .order('timestamp', { ascending: false })
    .limit(limitNum);

  // Optional filter by action type
  if (action_type && typeof action_type === 'string') {
    query = query.eq('action_type', action_type);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

// Get activity summary for a house (counts by action type)
export const getHouseActivitySummary = async (req: Request, res: Response): Promise<Response> => {
  const { house_id, days = '30' } = req.query;

  if (!house_id) {
    return res.status(400).json({ error: 'house_id is required' });
  }

  const daysBack = parseInt(days as string, 10);
  if (isNaN(daysBack) || daysBack < 1) {
    return res.status(400).json({ error: 'days must be a positive number' });
  }

  // Calculate the date X days ago
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysBack);
  const pastDateStr = pastDate.toISOString();

  const { data, error } = await supabase
    .from('food_log')
    .select('action_type')
    .eq('house_id', house_id)
    .gte('timestamp', pastDateStr);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Count by action type
  const summary = data?.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return res.status(200).json({
    house_id,
    period_days: daysBack,
    total_actions: data?.length || 0,
    by_action_type: summary,
  });
};
