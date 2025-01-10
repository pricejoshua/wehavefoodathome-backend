import { Request, Response } from "express";
import supabase from "../utils/supabase";
import { Tables } from "../types/db.types";

export const getProducts = async (req: Request, res: Response): Promise<Response>  => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

export const createProduct = async (req: Request, res: Response) => {
    const product = req.body as Tables<"products">;
    const { data, error } = await supabase.from("products").insert(product);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.json(data);
};

