import { Request, Response } from "express";
import supabase from "../utils/supabase";
import { TablesInsert } from "../types/db.types";

// Get a user profile by ID
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: "Profile not found" });
        }
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
};

// Get a user profile by username
export const getProfileByUsername = async (req: Request, res: Response): Promise<Response> => {
    const { username } = req.params;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: "Profile not found" });
        }
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
};

// Create a new user profile
export const createProfile = async (req: Request, res: Response): Promise<Response> => {
    const profile = req.body as TablesInsert<"profiles">;

    if (!profile.id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const { data, error } = await supabase
        .from("profiles")
        .insert(profile)
        .select();

    if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({ error: "Profile already exists for this user" });
        }
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
};

// Update a user profile
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating the ID
    delete updates.id;

    const { data, error } = await supabase
        .from("profiles")
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
    }

    return res.status(200).json(data[0]);
};

// Delete a user profile
export const deleteProfile = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(204).send();
};

// Search profiles by username or full name
export const searchProfiles = async (req: Request, res: Response): Promise<Response> => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
};
