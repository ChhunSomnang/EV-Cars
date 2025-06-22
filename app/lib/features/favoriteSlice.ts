import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthToken, isAuthenticated } from '../auth';
import { handleAPIError, createAuthHeaders, APIError } from '../api-utils';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

interface FavoriteItem {
  productId: number;
  favoriteId: number;
}

interface FavoriteState {
  favorites: FavoriteItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const defaultState: FavoriteState = {
  favorites: [],
  status: 'idle',
  error: null
};

export const addFavoriteProduct = createAsyncThunk(
  'favorites/addFavorite',
  async (productId: number) => {
    if (!isAuthenticated()) {
      throw new Error('Please log in to add favorites');
    }

    try {
      const response = await fetch(API_ENDPOINTS.FAVORITE.ADD, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ productId })
      });

      if (!response.ok) {
        console.error('Failed to add favorite:', {
          status: response.status,
          statusText: response.statusText
        });
        await handleAPIError(response);
        throw new Error('Failed to add favorite');
      }

      const text = await response.text();
      let favoriteId = productId; // Default to using productId as favoriteId

      if (text) {
        try {
          const data = JSON.parse(text);
          if (data && data.id) {
            favoriteId = data.id;
          }
        } catch (parseError) {
          console.warn('Could not parse response, using default favoriteId:', parseError);
        }
      }

      return {
        productId,
        favoriteId
      } as FavoriteItem;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }
);

export const removeFavoriteProduct = createAsyncThunk(
  'favorites/removeFavorite',
  async (favoriteId: number) => {
    if (!isAuthenticated()) {
      throw new Error('Please log in to remove favorites');
    }

    try {
      const response = await fetch(API_ENDPOINTS.FAVORITE.REMOVE(favoriteId), {
        method: 'DELETE',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        const responseClone = response.clone();
        const errorText = await responseClone.text();
        console.error('Failed to remove favorite:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: response.url,
          method: 'DELETE',
          timestamp: new Date().toISOString()
        });
        await handleAPIError(response);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
    return favoriteId;
  }
);

const loadState = (): FavoriteState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  if (!isAuthenticated()) {
    return defaultState;
  }

  try {
    const savedState = localStorage.getItem(STORAGE_KEYS.FAVORITE_PRODUCTS);
    if (!savedState) {
      return defaultState;
    }

    const parsedState = JSON.parse(savedState);
    if (!Array.isArray(parsedState)) {
      return defaultState;
    }

    // Convert old format to new format if necessary
    const favorites = parsedState.map((item: any) => {
      if (typeof item === 'number') {
        // Old format: just product ID
        return {
          productId: item,
          favoriteId: item // This will be updated when fetching from API
        };
      } else if (item && typeof item === 'object') {
        // New format: FavoriteItem
        return {
          productId: item.productId,
          favoriteId: item.favoriteId
        };
      }
      return null;
    }).filter((item): item is FavoriteItem => item !== null);

    return {
      favorites,
      status: 'idle',
      error: null
    };
  } catch (error) {
    console.error('Failed to load favorite products:', error);
    return defaultState;
  }
};

const saveState = (favorites: FavoriteItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FAVORITE_PRODUCTS, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Failed to save favorite products:', error);
  }
};

const initialState: FavoriteState = loadState();

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
      state.status = 'idle';
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.FAVORITE_PRODUCTS);
      }
    },
    refreshFavorites: (state) => {
      const token = getAuthToken();
      if (token) {
        state.status = 'loading';
        state.error = null;
      } else {
        state.favorites = [];
        state.status = 'idle';
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.FAVORITE_PRODUCTS);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserFavorites.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.favorites = action.payload;
        saveState(state.favorites);
      })
      .addCase(fetchUserFavorites.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch favorites';
      })
      .addCase(addFavoriteProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addFavoriteProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (!state.favorites.some(item => item.productId === action.payload.productId)) {
          state.favorites.push(action.payload);
          saveState(state.favorites);
        }
      })
      .addCase(addFavoriteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add favorite';
      })
      .addCase(removeFavoriteProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(removeFavoriteProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.favorites = state.favorites.filter(
          (item) => item.favoriteId !== action.payload
        );
        saveState(state.favorites);
      })
      .addCase(removeFavoriteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to remove favorite';
      });
  },
});

export const fetchUserFavorites = createAsyncThunk(
  'favorites/fetchUserFavorites',
  async () => {
    if (!isAuthenticated()) {
      return [];
    }

    try {
      const response = await fetch(API_ENDPOINTS.FAVORITE.LIST, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        const responseClone = response.clone();
        const errorText = await responseClone.text();
        const error = {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: response.url,
          method: 'GET',
          timestamp: new Date().toISOString()
        };
        await handleAPIError(response);
        return [];
      }

      const responseData = await response.json();
      // Handle both array response and {data: array} response formats
      const data = Array.isArray(responseData) ? responseData : responseData?.data;
      
      if (!Array.isArray(data)) {
        console.error('Unexpected response format - expected array but got:', typeof data, '\nResponse:', JSON.stringify(responseData));
        return [];
      }
      
      // Validate and map favorite items from the response
      const favoriteItems = data.reduce((validItems: FavoriteItem[], item: any) => {
        if (item && typeof item === 'object' && item.productId && item.id) {
          validItems.push({
            productId: Number(item.productId),
            favoriteId: Number(item.id)
          });
        } else {
          console.warn('Invalid item in favorites response:', item);
        }
        return validItems;
      }, []);
      
      return favoriteItems;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred while fetching favorites';
      await handleAPIError(error);
      return [];
    }
  }
);

export const { clearFavorites, refreshFavorites } = favoriteSlice.actions;

// Effect to fetch favorites when token changes
export const initializeFavorites = () => async (dispatch: any) => {
  dispatch(refreshFavorites());
  const token = getAuthToken();
  if (token) {
    try {
      await dispatch(fetchUserFavorites());
    } catch (error) {
      console.error('Failed to initialize favorites:', error);
    }
  }
};

export default favoriteSlice.reducer;