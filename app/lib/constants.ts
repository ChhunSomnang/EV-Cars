// app/lib/constants.ts

/**
 * API Endpoints
 */
export const API_BASE_URL = 'https://inventoryapiv1-367404119922.asia-southeast1.run.app';

export const API_ENDPOINTS = {
  // Favorite endpoints
  FAVORITE: {
    ADD: `${API_BASE_URL}/Favorite`,
    REMOVE: (id: number) => `${API_BASE_URL}/Favorite/${id}`,
    LIST: `${API_BASE_URL}/Favorite`,
  },
  // User endpoints
  USER: {
    LOGIN: `${API_BASE_URL}/User/Login`,
    REGISTER: `${API_BASE_URL}/User/Register`,
    PROFILE: `${API_BASE_URL}/User/Profile`,
  },
  // Product endpoints
  PRODUCT: {
    LIST: `${API_BASE_URL}/Product`,
    DETAIL: (id: number) => `${API_BASE_URL}/Product/${id}`,
  },
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'user',
  FAVORITE_PRODUCTS: 'favoriteProducts',
  COMPARE_PRODUCTS: 'compareProducts',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;