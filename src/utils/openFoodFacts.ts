import axios from 'axios';

interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    categories?: string;
    image_url?: string;
    nutriments?: Record<string, any>;
    ingredients_text?: string;
    allergens?: string;
    serving_size?: string;
    nutriscore_grade?: string;
    ecoscore_grade?: string;
  };
  status: number;
  status_verbose: string;
}

export interface ProductFromBarcode {
  barcode: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  metadata: {
    barcode: string;
    ingredients?: string;
    allergens?: string;
    serving_size?: string;
    nutriscore_grade?: string;
    ecoscore_grade?: string;
    nutriments?: Record<string, any>;
  };
}

/**
 * Fetch product information from Open Food Facts API using a barcode
 * @param barcode - The product barcode (UPC, EAN, etc.)
 * @returns Product information or null if not found
 */
export async function lookupBarcodeOpenFoodFacts(barcode: string): Promise<ProductFromBarcode | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const response = await axios.get<OpenFoodFactsProduct>(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'WeHaveFoodAtHome-Backend/1.0 (Food Tracking App)',
      },
    });

    // Check if product was found
    if (response.data.status === 0 || !response.data.product) {
      return null;
    }

    const { product } = response.data;

    // Extract main category from categories string
    const categoryList = product.categories?.split(',').map(c => c.trim());
    const mainCategory = categoryList?.[0] || undefined;

    // Build product description
    let description = product.brands ? `Brand: ${product.brands}` : '';
    if (product.categories) {
      description += description ? ` | Categories: ${product.categories}` : `Categories: ${product.categories}`;
    }

    return {
      barcode,
      name: product.product_name || `Product ${barcode}`,
      description: description || undefined,
      brand: product.brands,
      category: mainCategory,
      imageUrl: product.image_url,
      metadata: {
        barcode,
        ingredients: product.ingredients_text,
        allergens: product.allergens,
        serving_size: product.serving_size,
        nutriscore_grade: product.nutriscore_grade,
        ecoscore_grade: product.ecoscore_grade,
        nutriments: product.nutriments,
      },
    };
  } catch (error: any) {
    if (error.response) {
      // Product not found (404) is not an error, just return null
      if (error.response.status === 404) {
        return null;
      }
      console.error('Open Food Facts API error:', error.message || error);
    } else {
      console.error('Unexpected error looking up barcode:', error);
    }
    return null;
  }
}
