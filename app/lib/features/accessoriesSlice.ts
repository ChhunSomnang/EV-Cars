import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// R2 Bucket URL constant
const R2_BUCKET_URL = "https://pub-133f8593b35749f28fa090bc33925b31.r2.dev";

export interface Accessory {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  weight: number;
  color: string;
  categoryId: number;
  category: string;
  brandId: number;
  brand: string;
  location: string;
  sku: string;
  price: number;
  compatibleModels: any[];
}

export interface Filter {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
}

interface AccessoriesState {
  accessories: Accessory[];
  filteredAccessories: Accessory[];
  filter: Filter;
  loading: boolean;
  error: string | null;
}

const initialState: AccessoriesState = {
  accessories: [],
  filteredAccessories: [],
  filter: {
    category: "",
    brand: "",
    minPrice: 0,
    maxPrice: Infinity,
  },
  loading: false,
  error: null,
};

// Helper function to get full image URL
export const getAccessoryImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  // If imagePath already contains full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, construct URL with R2 bucket
  return `${R2_BUCKET_URL}/${imagePath}`;
};

export const fetchAccessories = createAsyncThunk(
  "accessories/fetchAccessories",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching accessories from API...');
      const response = await axios.get("https://inventoryapiv1-367404119922.asia-southeast1.run.app/Accessory");
      
      console.log('API Response:', response.data);
      
      // Handle different response structures
      let data;
      if (response.data.data) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else {
        throw new Error('Unexpected API response structure');
      }
      
      console.log('Processed data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('API did not return an array of accessories');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching accessories:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('Failed to fetch accessories');
    }
  }
);

const accessoriesSlice = createSlice({
  name: "accessories",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Filter>) => {
      state.filter = action.payload;
    },
    applyFilter: (state) => {
      const { category, brand, minPrice, maxPrice } = state.filter;
      const filtered = state.accessories.filter((item) => {
        const isCategoryMatch = category ? item.category === category : true;
        const isBrandMatch = brand ? item.brand === brand : true;
        const isPriceMatch = item.price >= minPrice && item.price <= maxPrice;
        return isCategoryMatch && isBrandMatch && isPriceMatch;
      });
      state.filteredAccessories = filtered;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessories.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Fetching accessories - pending');
      })
      .addCase(fetchAccessories.fulfilled, (state, action) => {
        state.loading = false;
        state.accessories = action.payload;
        state.filteredAccessories = action.payload;
        console.log('Fetching accessories - fulfilled:', action.payload.length, 'items');
      })
      .addCase(fetchAccessories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Error fetching accessories.";
        console.error('Fetching accessories - rejected:', action.payload);
      });
  },
});

export const { setFilter, applyFilter, clearError } = accessoriesSlice.actions;

export default accessoriesSlice.reducer;