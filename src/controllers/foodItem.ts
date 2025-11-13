import { Request, Response } from "express";
import supabase from "../utils/supabase";
import { Tables, TablesInsert } from "../types/db.types";

// Get all food items for a house
export const getFoodItems = async (req: Request, res: Response): Promise<Response> => {
    const { house_id } = req.query;

    if (!house_id) {
        return res.status(400).json({ error: "house_id is required" });
    }

    const { data, error } = await supabase
        .from("food_item")
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
        .eq("house_id", house_id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
};

// Get a single food item by ID
export const getFoodItem = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("food_item")
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
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: "Food item not found" });
        }
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
};

// Add a new food item to a house
export const createFoodItem = async (req: Request, res: Response): Promise<Response> => {
    const foodItem = req.body as TablesInsert<"food_item">;

    // Validate required fields
    if (!foodItem.house_id || !foodItem.product_id) {
        return res.status(400).json({
            error: "house_id and product_id are required"
        });
    }

    const { data, error } = await supabase
        .from("food_item")
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
        await supabase.from("food_log").insert({
            food_id: data[0].id,
            house_id: foodItem.house_id,
            user_id: foodItem.user_id || null,
            action_type: "added",
            quantity: foodItem.quantity || null,
            unit: foodItem.unit || null,
            notes: "Item added to house"
        });
    }

    return res.status(201).json(data);
};

// Update a food item
export const updateFoodItem = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
        .from("food_item")
        .update(updates)
        .eq("id", id)
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
        return res.status(404).json({ error: "Food item not found" });
    }

    // Log the update in food_log
    await supabase.from("food_log").insert({
        food_id: id,
        house_id: data[0].house_id,
        user_id: updates.user_id || null,
        action_type: "updated",
        quantity: updates.quantity || null,
        unit: updates.unit || null,
        notes: "Item updated"
    });

    return res.status(200).json(data[0]);
};

// Delete a food item (when consumed/removed)
export const deleteFoodItem = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    // First get the food item to log it
    const { data: foodItem } = await supabase
        .from("food_item")
        .select("*")
        .eq("id", id)
        .single();

    if (foodItem) {
        // Log the deletion in food_log
        await supabase.from("food_log").insert({
            food_id: id,
            house_id: foodItem.house_id,
            user_id: foodItem.user_id || null,
            action_type: "removed",
            quantity: foodItem.quantity || null,
            unit: foodItem.unit || null,
            notes: "Item removed from house"
        });
    }

    const { error } = await supabase
        .from("food_item")
        .delete()
        .eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(204).send();
};

// Search food items by product name or barcode
export const searchFoodItems = async (req: Request, res: Response): Promise<Response> => {
    const { house_id, query } = req.query;

    if (!house_id) {
        return res.status(400).json({ error: "house_id is required" });
    }

    if (!query) {
        return res.status(400).json({ error: "query parameter is required" });
    }

    const { data, error } = await supabase
        .from("food_item")
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
        .eq("house_id", house_id)
        .ilike("products.name", `%${query}%`);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
};
