import { Request, Response } from 'express';
import supabase from '../utils/supabase';
import { Tables } from '../types/db.types';
import { lookupBarcodeOpenFoodFacts } from '../utils/openFoodFacts';

export const getProducts = async (req: Request, res: Response): Promise<Response>  => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

export const createProduct = async (req: Request, res: Response) => {
  const product = req.body as Tables<'products'>;
  const { data, error } = await supabase.from('products').insert(product).select();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(201).json(data);
};

export const getProduct = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.status(200).json(data[0]);
};

export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(204).send();
};

// Search products by barcode (stored in metadata)
export const searchByBarcode = async (req: Request, res: Response): Promise<Response> => {
  const { barcode } = req.params;

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required' });
  }

  // Search for products where metadata contains the barcode
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .contains('metadata', { barcode });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Product not found with this barcode' });
  }

  // Return the first matching product
  return res.status(200).json(data[0]);
};

// Search products by name
export const searchProducts = async (req: Request, res: Response): Promise<Response> => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${query}%`);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

/**
 * Lookup barcode in Open Food Facts and create product if it doesn't exist
 * This endpoint will:
 * 1. Check if product exists in our database
 * 2. If not, look it up in Open Food Facts
 * 3. If found in Open Food Facts, create it in our database with that data
 * 4. If NOT found in Open Food Facts AND manual data provided, create with manual data
 * 5. Return the product
 *
 * Request body (optional - for manual product creation if not in Open Food Facts):
 * {
 *   "name": "Product Name",
 *   "description": "Optional description",
 *   "category": Optional category ID,
 *   "metadata": { any additional metadata }
 * }
 */
export const lookupAndCreateFromBarcode = async (req: Request, res: Response): Promise<Response> => {
  const { barcode } = req.params;
  const manualData = req.body; // Optional manual product data

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required' });
  }

  try {
    // First, check if product already exists in our database
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .contains('metadata', { barcode })
      .limit(1)
      .maybeSingle();

    if (existingProduct) {
      return res.status(200).json({
        product: existingProduct,
        source: 'database',
        created: false,
      });
    }

    // Product doesn't exist, look it up in Open Food Facts
    const productInfo = await lookupBarcodeOpenFoodFacts(barcode);

    if (productInfo) {
      // Found in Open Food Facts - create from API data
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: productInfo.name,
          description: productInfo.description,
          metadata: productInfo.metadata,
        })
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      return res.status(201).json({
        product: newProduct,
        source: 'openfoodfacts',
        created: true,
        message: 'Product automatically created from Open Food Facts',
      });
    }

    // Not found in Open Food Facts - check if manual data provided
    if (!manualData || !manualData.name) {
      return res.status(404).json({
        error: 'Product not found in Open Food Facts database',
        barcode,
        message: 'Please provide product details (name is required) to create this product manually',
      });
    }

    // Create product with manual data
    const productToInsert = {
      name: manualData.name,
      description: manualData.description || null,
      category: manualData.category || null,
      metadata: {
        barcode,
        ...(manualData.metadata || {}),
        source: 'manual',
      },
    };

    const { data: manualProduct, error: manualInsertError } = await supabase
      .from('products')
      .insert(productToInsert)
      .select()
      .single();

    if (manualInsertError) {
      return res.status(500).json({ error: manualInsertError.message });
    }

    return res.status(201).json({
      product: manualProduct,
      source: 'manual',
      created: true,
      message: 'Product created manually with provided data',
    });

  } catch (error) {
    console.error('Error in lookupAndCreateFromBarcode:', error);
    return res.status(500).json({
      error: 'Internal server error while processing barcode lookup',
    });
  }
};
