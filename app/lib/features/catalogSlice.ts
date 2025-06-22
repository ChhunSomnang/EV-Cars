// lib/features/catalogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
}

interface CatalogState {
  categories: Category[];
  selectedCategory: string | null; // This type is correct!
  isLoading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    // *** THIS IS THE CRUCIAL CHANGE ***
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCategories, setSelectedCategory, setLoading, setError } = catalogSlice.actions;
export default catalogSlice.reducer;