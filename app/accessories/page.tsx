"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccessories, setFilter, applyFilter } from "../lib/features/accessoriesSlice";
import { RootState, AppDispatch } from "../lib/store";
import AccessoriesFilter from "../components/AccessoriesFilter";
import Image from "next/image";
import Link from "next/link";
import { Filter } from "../lib/features/accessoriesSlice";
import axios from "axios";

// Types for API responses
interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  data: T[];
}

// Modal Component for Creating New Accessory
const CreateAccessoryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  // ✅ CORRECT: useDispatch at component top level
  const dispatch = useDispatch<AppDispatch>();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
    weight: 0,
    color: '',
    categoryId: 0,
    brandId: 0,
    location: '',
    price: 0,
    compatibleModels: []
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch brands and categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBrandsAndCategories();
    }
  }, [isOpen]);

  const fetchBrandsAndCategories = async () => {
    setLoading(true);
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        axios.get<ApiResponse<Brand>>('https://inventoryapiv1-367404119922.asia-southeast1.run.app/Brand'),
        axios.get<ApiResponse<Category>>('https://inventoryapiv1-367404119922.asia-southeast1.run.app/Category')
      ]);
      
      setBrands(brandsResponse.data.data);
      setCategories(categoriesResponse.data.data);
    } catch (error) {
      console.error('Error fetching brands and categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      // Validate required fields
      if (!formData.brandId || !formData.categoryId) {
        alert('Please select both brand and category');
        setLoading(false);
        return;
      }

      if (!formData.image) {
        alert('Please select an image');
        setLoading(false);
        return;
      }

      // Create FormData matching the exact API requirements
      const formDataToSend = new FormData();
      formDataToSend.append('BrandId', formData.brandId.toString());
      formDataToSend.append('Color', formData.color || 'Not specified');
      formDataToSend.append('Price', (formData.price > 0 ? formData.price : 0).toString());
      formDataToSend.append('Name', formData.name.trim());
      formDataToSend.append('Location', formData.location.trim() || 'Not specified');
      formDataToSend.append('ReviewCount', '0');
      formDataToSend.append('PhoneNumber', 'Not specified'); // Add required field
      formDataToSend.append('Weight', (formData.weight > 0 ? formData.weight : 0).toString());
      formDataToSend.append('CategoryId', formData.categoryId.toString());
      formDataToSend.append('Image', formData.image);
      formDataToSend.append('Description', formData.description.trim());
      formDataToSend.append('CompatibleModels', formData.compatibleModels.length > 0 ? formData.compatibleModels.join(',') : 'None');
      
      // Send POST request to create accessory with authorization
      const response = await axios.post(
        'https://inventoryapiv1-367404119922.asia-southeast1.run.app/Accessory',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      console.log('Accessory created successfully:', response.data);
      
      // ✅ CORRECT: Now just call dispatch (no useDispatch here)
      dispatch(fetchAccessories());
      
      // Close modal and reset form
      onClose();
      setFormData({
        name: '',
        description: '',
        image: null,
        weight: 0,
        color: '',
        categoryId: 0,
        brandId: 0,
        location: '',
        price: 0,
        compatibleModels: []
      });
      setImagePreview(null);
      
      // Optionally refresh the accessories list
      // dispatch(fetchAccessories());
      
    } catch (error) {
      console.error('Error creating accessory:', error);
      
      // Handle different error types
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          alert('You do not have permission to create accessories.');
        } else {
          alert(`Failed to create accessory: ${error.response?.data?.message || error.message}`);
        }
      } else {
        alert('Failed to create accessory. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'categoryId' || name === 'brandId' || name === 'price' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Accessory</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading categories and brands...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value={0}>Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value={0}>Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  required
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={formData.categoryId === 0 || formData.brandId === 0 || loading}
                >
                  {loading ? 'Creating...' : 'Create Accessory'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AccessoriesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessories, filteredAccessories, filter, loading, error } = useSelector(
    (state: RootState) => state.accessories
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const R2_BUCKET_URL = "https://pub-133f8593b35749f28fa090bc33925b31.r2.dev";

  useEffect(() => {
    dispatch(fetchAccessories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(applyFilter());
  }, [filter, dispatch]);

  const categories = [...new Set(accessories.map((item) => item.category))];
  const brands = [...new Set(accessories.map((item) => item.brand))];

  if (loading) {
    return <p className="text-center text-xl text-gray-600">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-xl text-red-600">{error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        Discover EV Car Accessories
      </h1>
      
      {/* Post New Accessory Button */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          Post New Accessory
        </button>
      </div>
      
      <AccessoriesFilter
        categories={categories}
        brands={brands}
        filter={filter}
        setFilter={(newFilter: Filter) => dispatch(setFilter(newFilter))}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredAccessories.map((item) => {
          const imageUrl = item.image.startsWith("http")
            ? item.image
            : `${R2_BUCKET_URL}/${item.image}`;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100"
            >
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="rounded-lg object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "/fallback-image.png";
                    target.onerror = null;
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold mt-4 mb-2 text-gray-900 line-clamp-2">
                {item.name}
              </h2>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-semibold">Brand:</span> {item.brand}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-semibold">Category:</span> {item.category}
              </p>
              <p className="text-gray-600 text-sm mb-3">
                <span className="font-semibold">SKU:</span> {item.sku}
              </p>
              <p className="text-2xl font-extrabold text-blue-700 mb-4">
                ${item.price.toFixed(2)}
              </p>
              <div className="flex items-center justify-center mt-auto mb-4">
                <span className="text-yellow-500 mr-1 font-semibold">{item.rating.toFixed(1)}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${
                        index < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500 text-sm ml-2">({item.reviewCount} reviews)</span>
              </div>
              <Link href={`/accessories/${item.id}`} className="w-full">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 transform hover:-translate-y-0.5 shadow-md">
                  View Details
                </button>
              </Link>
            </div>
          );
        })}
      </div>
      
      {/* Modal */}
      <CreateAccessoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default AccessoriesPage;