// app/catalog/page.tsx (or pages/catalog/index.tsx if using pages directory)
"use client";

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../lib/store'; // Adjust path
import {
  setCategories,
  setSelectedCategory,
  setLoading,
  setError,
} from '../lib/features/catalogSlice'; // Adjust path
import CategoryCard from '../components/CategoryCard'; // Adjust path
import { CircularProgress } from '@mui/material'; // For a nice loading spinner

// Define the Category interface based on your slice (or import it from a types file)
interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
}

const CatalogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, selectedCategory, isLoading, error } = useSelector(
    (state: RootState) => state.catalog
  );

  useEffect(() => {
    const fetchCategoriesData = async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        // --- Replace with your actual API call to fetch categories ---
        // For demonstration, we'll fetch from a local JSON file in the public directory.
        const response = await fetch('/categories.json'); // Example: public/categories.json
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Category[] = await response.json();
        dispatch(setCategories(data));
      } catch (err) {
        dispatch(setError(`Failed to load categories: ${err instanceof Error ? err.message : 'Unknown error'}`));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCategoriesData();
  }, [dispatch]);

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setSelectedCategory(categoryId));
    // You might also want to navigate to a category-specific page
    // For example: router.push(`/catalog/${categoryId}`);
    // Or trigger a filter for products within this category
    console.log(`Category clicked: ${categoryId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <CircularProgress color="primary" size={60} />
        <p className="ml-4 text-xl text-gray-700">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <p className="text-red-600 text-2xl font-semibold mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()} // Simple retry
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <p className="text-gray-700 text-2xl font-semibold mb-4">No categories found.</p>
        <p className="text-gray-500">Please check your data source.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-16 text-gray-900 leading-tight">
        Explore Our Catalog
      </h1>

      {selectedCategory && (
  <div className="text-center mb-10 p-4 bg-blue-100 text-blue-800 rounded-lg shadow-inner">
    <p className="text-xl font-semibold">Selected Category: {selectedCategory}</p>
    <button
      onClick={() => dispatch(setSelectedCategory(null))} // <--- This line
      className="mt-2 text-sm text-blue-600 hover:underline"
    >
      Clear Selection
    </button>
  </div>
)}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} onClick={handleCategoryClick} />
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;