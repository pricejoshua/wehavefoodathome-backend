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

// Get all houses for a user
export const getUserHouses = async (req: Request, res: Response): Promise<Response> => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const { data, error } = await supabase
    .from('user_houses')
    .select(`
            house_id,
            created_at,
            houses (
                id,
                name,
                description,
                created_at
            )
        `)
    .eq('user_id', user_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

// Get a single house by ID
export const getHouse = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to access this house' });
  }

  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'House not found' });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

// Get all members of a house
export const getHouseMembers = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, id);
  if (!isMember) {
    return res.status(403).json({ error: "You do not have permission to view this house's members" });
  }

  const { data, error } = await supabase
    .from('user_houses')
    .select(`
            user_id,
            created_at,
            profiles (
                id,
                username,
                full_name,
                avatar_url
            )
        `)
    .eq('house_id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

// Create a new house
export const createHouse = async (req: Request, res: Response): Promise<Response> => {
  const house = req.body as TablesInsert<'houses'>;

  if (!house.name) {
    return res.status(400).json({ error: 'House name is required' });
  }

  const { data, error } = await supabase
    .from('houses')
    .insert(house)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
};

// Update a house
export const updateHouse = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updates = req.body;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to update this house' });
  }

  const { data, error } = await supabase
    .from('houses')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'House not found' });
  }

  return res.status(200).json(data[0]);
};

// Delete a house
export const deleteHouse = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is a member of this house
  const isMember = await isHouseMember(userId, id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to delete this house' });
  }

  const { error } = await supabase
    .from('houses')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(204).send();
};

// Add a user to a house
export const addUserToHouse = async (req: Request, res: Response): Promise<Response> => {
  const { house_id, user_id } = req.body;
  const requesterId = getUserId(req);

  if (!requesterId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!house_id || !user_id) {
    return res.status(400).json({ error: 'house_id and user_id are required' });
  }

  // Check if requester is a member of this house
  const isMember = await isHouseMember(requesterId, house_id);
  if (!isMember) {
    return res.status(403).json({ error: 'You do not have permission to add users to this house' });
  }

  const { data, error } = await supabase
    .from('user_houses')
    .insert({ house_id, user_id })
    .select();

  if (error) {
    // Check for unique constraint violation (user already in house)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'User is already a member of this house' });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
};

// Remove a user from a house
export const removeUserFromHouse = async (req: Request, res: Response): Promise<Response> => {
  const { house_id, user_id } = req.body;
  const requesterId = getUserId(req);

  if (!requesterId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!house_id || !user_id) {
    return res.status(400).json({ error: 'house_id and user_id are required' });
  }

  // Check if requester is a member of this house or is removing themselves
  const isMember = await isHouseMember(requesterId, house_id);
  if (!isMember && requesterId !== user_id) {
    return res.status(403).json({ error: 'You do not have permission to remove users from this house' });
  }

  const { error } = await supabase
    .from('user_houses')
    .delete()
    .eq('house_id', house_id)
    .eq('user_id', user_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(204).send();
};
