import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the CartItem interface
export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  eCurrencyType?: string; // Optional field
}

// Define the CartState interface
interface CartState {
  items: CartItem[];
}

// Initial state
const initialState: CartState = {
  items: [],
};

// Helper function to load cart from localStorage
const getCartFromStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  }
  return [];
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cartItems: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }
};

// Create the cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: getCartFromStorage(), // Use the renamed helper function here
  },
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      console.log("Adding to cart:", action.payload); // Debugging line
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({ ...action.payload });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload); // Remove item by ID
      saveCartToStorage(state.items); // Save updated cart to localStorage
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity; // Update quantity
      }
      saveCartToStorage(state.items); // Save updated cart to localStorage
    },
    clearCart: (state) => {
      state.items = []; // Reset cart to empty
      saveCartToStorage([]); // Clear cart in localStorage
    },
    loadCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload; // Reload cart from localStorage
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCartFromStorage, // Keep the original name for the action
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;