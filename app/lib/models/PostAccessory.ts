export interface PostAccessory {
  name: string;
  description: string;
  image: string;
  weight: number;
  color: string;
  categoryId: number;
  brandId: number;
  location: string;
  sku: string;
  price: number;
  compatibleModels?: any[];
}

// Optional: Validation interface for form data
export interface PostAccessoryFormData {
  name: string;
  description: string;
  image: File | string; // Can be File for upload or string for URL
  weight: number;
  color: string;
  categoryId: number;
  brandId: number;
  location: string;
  sku: string;
  price: number;
  compatibleModels?: string[]; // Array of model IDs or names
}

// Validation function
export const validatePostAccessory = (data: PostAccessory): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (!data.image || data.image.trim().length === 0) {
    errors.push('Image is required');
  }
  
  if (!data.sku || data.sku.trim().length === 0) {
    errors.push('SKU is required');
  }
  
  if (data.price <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  if (data.weight <= 0) {
    errors.push('Weight must be greater than 0');
  }
  
  if (!data.categoryId || data.categoryId <= 0) {
    errors.push('Valid category is required');
  }
  
  if (!data.brandId || data.brandId <= 0) {
    errors.push('Valid brand is required');
  }
  
  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required');
  }
  
  return errors;
};