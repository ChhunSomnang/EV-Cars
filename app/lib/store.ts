import { configureStore, Middleware } from "@reduxjs/toolkit";
import cartReducer from "./features/store/cartSlice";
import productReducer from "./features/productSlice";
import accessoriesReducer from "./features/accessoriesSlice";
import compareReducer from "./features/compareSlice";
import catalogReducer from './features/catalogSlice';
import favoriteReducer from './features/favoriteSlice';

// Custom middleware to save compare state to localStorage
const saveCompareToLocalStorage: Middleware = (store) => (next) => (action: unknown) => {
  const result = next(action);

  // Check if the action affects the compare slice
  if (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    (action as { type: string }).type.startsWith("compare/") &&
    typeof window !== "undefined"
  ) {
    const state = store.getState();
    const selectedProducts = state.compare.selectedProducts;

    console.log("Saving to localStorage:", selectedProducts); // Debugging line
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }

  return result;
};

// Configure the Redux store
const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    accessories: accessoriesReducer,
    compare: compareReducer,
    catalog: catalogReducer,
    favorites: favoriteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(saveCompareToLocalStorage), // Add custom middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
