import { Request, Response } from "express";
import supabase from "../utils/supabase";
import { Tables } from "../types/db.types";

export const getProducts = async (req: Request, res: Response): Promise<Tables<"products">> => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.json(data);
};

export const createProduct = async (req: Request, res: Response) => {
    const product = req.body as Tables<"products">;
    const { name, price } = req.body;
    const { data, error } = await supabase.from("products").insert({ name, price });
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.json(data);
};

