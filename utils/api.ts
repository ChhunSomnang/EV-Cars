import axios from 'axios';

const PRODUCTS_API_BASE_URL = process.env.NEXT_PUBLIC_PRODUCTS_API_BASE_URL;

if (!PRODUCTS_API_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_PRODUCTS_API_BASE_URL in .env.local");
}

export const getProducts = async (token: string) => {
  try {
    const response = await axios.get(`${PRODUCTS_API_BASE_URL}/Product`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
