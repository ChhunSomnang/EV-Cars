import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const PRODUCTS_API_BASE_URL = "https://inventoryapiv1-367404119922.asia-southeast1.run.app";
const R2_BUCKET_URL = "https://pub-133f8593b35749f28fa090bc33925b31.r2.dev";
const FALLBACK_PRODUCT_IMAGE = "https://placehold.co/800x600/e0e0e0/555555?text=No+Image";

// Convert image filename to full URL
const toAbsoluteImageUrl = (filename: string | undefined | null): string =>
  filename && !filename.startsWith("http")
    ? `${R2_BUCKET_URL}/${filename}`
    : filename || FALLBACK_PRODUCT_IMAGE;

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  gallery: string[];
  model: string;
  color: string;
  phoneNumber: string;
  condition: string;
  categoryId: number;
  category: string;
  brandId: number;
  brand: string;
  sku: string;
  location: string;
  isFeatured: boolean;
  eCurrencyType: string;
  user?: { name: string };
  imgSrc: string;
  name: string;
  vendor: string;
  bodyStyle: string;
}

interface ProductState {
  items: Product[];
  filteredItems: Product[];
  selectedMakes: string[];
  selectedCategories: string[];
  selectedConditions: string[];
  minPrice?: number;
  maxPrice?: number;
  selectedLocations: string[];
  isFeaturedFilter: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  totalItems: number;
}

const initialState: ProductState = {
  items: [],
  filteredItems: [],
  selectedMakes: [],
  selectedCategories: [],
  selectedConditions: [],
  minPrice: undefined,
  maxPrice: undefined,
  selectedLocations: [],
  isFeaturedFilter: false,
  status: "idle",
  error: null,
  totalItems: 0,
};

interface FetchProductsParams {
  pageSize?: number;
  currentPage?: number;
}

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async ({ pageSize = 126, currentPage = 1 }: FetchProductsParams = {}, thunkAPI) => {
    try {
      const { data } = await axios.get(`${PRODUCTS_API_BASE_URL}/Product`, {
        params: { PageSize: pageSize, CurrentPage: currentPage }
      });

      const arr = Array.isArray(data?.data) ? data.data : [];

      return {
        items: arr.map((car: any): Product => ({
          id: car.id,
          title: car.title || "",
          description: car.description || "",
          price: Number(car.price) || 0,
          image: toAbsoluteImageUrl(car.image),
          imgSrc: toAbsoluteImageUrl(car.image),
          gallery: Array.isArray(car.gallery) && car.gallery.length > 0
            ? car.gallery[0].split(",").map((g: string) => g.trim()).filter(Boolean).map(toAbsoluteImageUrl)
            : [],
          eCurrencyType: car.eCurrencyType || "",
          isFeatured: !!car.isFeatured,
          location: car.location || "",
          model: car.model || "",
          color: car.color || "",
          phoneNumber: car.phoneNumber || "",
          condition: car.condition || "",
          categoryId: Number(car.categoryId) || 0,
          category: car.category || "",
          brandId: Number(car.brandId) || 0,
          brand: (car.brand || "").trim() || "Unknown Brand",
          sku: car.sku || "",
          name: car.model || "",
          vendor: (car.brand || "").trim() || "Unknown Brand",
          bodyStyle: car.category || "",
          user: car.user ? { name: car.user.name || "" } : undefined,
        })),
        totalItems: data.totalItems || 0,
      };
    } catch (error: any) {
      const msg = axios.isAxiosError(error) && error.response
        ? error.response.data?.message || error.response.data?.error || `API error ${error.response.status}`
        : error.message || "Network error";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedMakes: (s, a: PayloadAction<string[]>) => { s.selectedMakes = a.payload; },
    setSelectedCategories: (s, a: PayloadAction<string[]>) => { s.selectedCategories = a.payload; },
    setSelectedConditions: (s, a: PayloadAction<string[]>) => { s.selectedConditions = a.payload; },
    setMinPrice: (s, a: PayloadAction<number | undefined>) => { s.minPrice = a.payload; },
    setMaxPrice: (s, a: PayloadAction<number | undefined>) => { s.maxPrice = a.payload; },
    setSelectedLocations: (s, a: PayloadAction<string[]>) => { s.selectedLocations = a.payload; },
    setIsFeaturedFilter: (s, a: PayloadAction<boolean>) => { s.isFeaturedFilter = a.payload; },
    resetFilters: (s) => {
      s.selectedMakes = [];
      s.selectedCategories = [];
      s.selectedConditions = [];
      s.minPrice = undefined;
      s.maxPrice = undefined;
      s.selectedLocations = [];
      s.isFeaturedFilter = false;
      s.filteredItems = s.items;
    },
    applyFilters: (s) => {
      let f = [...s.items];

      if (s.selectedMakes.length > 0) {
        f = f.filter(item => {
          const brand = item.brand.toLowerCase().trim();
          const vendor = item.vendor.toLowerCase().trim();
          return s.selectedMakes.some(make =>
            brand === make.toLowerCase().trim() ||
            vendor === make.toLowerCase().trim()
          );
        });
      }

      if (s.selectedCategories.length > 0) {
        f = f.filter(item =>
          s.selectedCategories.some(cat =>
            item.category.toLowerCase().trim() === cat.toLowerCase().trim()
          )
        );
      }

      if (s.selectedConditions.length > 0) {
        f = f.filter(item =>
          s.selectedConditions.some(cond =>
            item.condition.toLowerCase().trim() === cond.toLowerCase().trim()
          )
        );
      }

      if (s.minPrice !== undefined || s.maxPrice !== undefined) {
        f = f.filter(item => {
          const price = item.price;
          const minOk = s.minPrice === undefined || price >= s.minPrice;
          const maxOk = s.maxPrice === undefined || price <= s.maxPrice;
          return minOk && maxOk;
        });
      }

      if (s.selectedLocations.length > 0) {
        f = f.filter(item =>
          s.selectedLocations.some(loc =>
            item.location.toLowerCase().trim() === loc.toLowerCase().trim()
          )
        );
      }

      if (s.isFeaturedFilter) {
        f = f.filter(item => item.isFeatured);
      }

      s.filteredItems = f;

      console.log("Filter applied", {
        totalItems: s.items.length,
        filtered: f.length,
        selectedMakes: s.selectedMakes,
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  }
});

export const {
  setSelectedMakes,
  setSelectedCategories,
  setSelectedConditions,
  setMinPrice,
  setMaxPrice,
  setSelectedLocations,
  setIsFeaturedFilter,
  resetFilters,
  applyFilters,
} = productSlice.actions;

export default productSlice.reducer;
