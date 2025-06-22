import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CompareState {
  selectedProducts: number[];
  maxProducts: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const loadState = (): CompareState => {
  const defaultState: CompareState = {
    selectedProducts: [],
    maxProducts: 4,
    status: 'idle',
    error: null
  };

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const savedProducts = localStorage.getItem('compareProducts');
    return {
      ...defaultState,
      selectedProducts: savedProducts ? JSON.parse(savedProducts) : []
    };
  } catch (err) {
    console.error('Failed to load compare products:', err);
    return defaultState;
  }
};

const saveState = (selectedProducts: number[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('compareProducts', JSON.stringify(selectedProducts));
    } catch (err) {
      console.error('Failed to save compare products:', err);
    }
  }
};

const initialState: CompareState = loadState();

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addProductToCompare: (state, action: PayloadAction<number>) => {
      if (state.selectedProducts.length >= state.maxProducts) {
        state.error = `Cannot compare more than ${state.maxProducts} products at once`;
        return;
      }
      if (!state.selectedProducts.includes(action.payload)) {
        state.selectedProducts.push(action.payload);
        state.error = null;
        saveState(state.selectedProducts);
      }
    },
    removeProductFromCompare: (state, action: PayloadAction<number>) => {
      state.selectedProducts = state.selectedProducts.filter(
        (id) => id !== action.payload
      );
      saveState(state.selectedProducts);
    },
    clearCompareList: (state) => {
      state.selectedProducts = [];
      state.error = null;
      state.status = 'idle';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('compareProducts');
      }
    },
  },
});

export const {
  addProductToCompare,
  removeProductFromCompare,
  clearCompareList,
} = compareSlice.actions;

export default compareSlice.reducer;