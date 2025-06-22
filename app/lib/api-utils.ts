// app/lib/api-utils.ts

/**
 * Custom error class for API responses
 */
export class APIError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Handles API response errors and returns user-friendly error messages
 */
export async function handleAPIError(response: Response): Promise<never> {
  const errorData = await response.text();
  
  switch (response.status) {
    case 400:
      throw new APIError('Invalid request. Please check your input.', 400);
    case 401:
      throw new APIError('Please log in to continue.', 401);
    case 403:
      throw new APIError('You do not have permission to perform this action.', 403);
    case 404:
      throw new APIError('The requested resource was not found.', 404);
    case 500:
      throw new APIError('Server error occurred. Please try again later.', 500);
    default:
      throw new APIError(
        errorData || `Request failed with status ${response.status}`,
        response.status
      );
  }
}

/**
 * Creates headers with authentication token
 */
export function createAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Checks if the response indicates an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof APIError && error.status === 401;
}