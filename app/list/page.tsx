"use client";

import React, { useEffect, useCallback, useState, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { CircularProgress } from "@mui/material";

import { RootState, AppDispatch } from "../lib/store";
import ProductCardList from "../components/ProductCardList";
import Filter from "../components/filter";

import {
  fetchProducts,
  applyFilters,
  setSelectedMakes,
} from "../lib/features/productSlice";

import type { Product } from "../lib/features/productSlice";

interface ProductState {
  filteredItems: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  items: Product[];
  selectedMakes: string[];
  error: string | null;
}

const ListContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const brandFromQuery = searchParams?.get("brand");

  const { filteredItems, status, items, selectedMakes, error } = useSelector(
    (state: RootState) => state.products as ProductState
  );

  // Pagination state and page size
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Initialize product fetch when idle or failed
  const initializeProducts = useCallback(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, status]);

  // Sync selectedMakes with URL brand query param
  const syncBrandWithUrl = useCallback(() => {
    if (brandFromQuery) {
      const brandParam = brandFromQuery.toLowerCase().trim();

      // Try to find a matching brand from items
      const matchingBrand = items.find((item) => {
        const itemBrand = (item.brand || "").toLowerCase().trim();
        return itemBrand === brandParam;
      });

      const brandToUse = matchingBrand ? matchingBrand.brand : brandFromQuery;

      if (!selectedMakes.includes(brandToUse)) {
        const updatedMakes = [...selectedMakes, brandToUse];
        dispatch(setSelectedMakes(updatedMakes));
        dispatch(applyFilters());
      }
    }
  }, [brandFromQuery, dispatch, items, selectedMakes]);

  // Apply filters after products load or selectedMakes change
  const applyProductFilters = useCallback(() => {
    if (status === "succeeded" && items.length > 0) {
      dispatch(applyFilters());
    }
  }, [dispatch, status, items.length]);

  // Effect hooks
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

  useEffect(() => {
    syncBrandWithUrl();
  }, [syncBrandWithUrl]);

  useEffect(() => {
    applyProductFilters();
  }, [applyProductFilters, selectedMakes]);

  // Reset to first page when filteredItems change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems.length]);

  // Pagination slicing
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredItems.slice(startIndex, endIndex);

  return (
    <div>
      {/* Your existing JSX */}
    </div>
  );
};

const ListContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const brandFromQuery = searchParams?.get("brand");

  const { filteredItems, status, items, selectedMakes, error } = useSelector(
    (state: RootState) => state.products as ProductState
  );

  // Pagination state and page size
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Initialize product fetch when idle or failed
  const initializeProducts = useCallback(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, status]);

  // Sync selectedMakes with URL brand query param
  const syncBrandWithUrl = useCallback(() => {
    if (brandFromQuery) {
      const brandParam = brandFromQuery.toLowerCase().trim();

      // Try to find a matching brand from items
      const matchingBrand = items.find((item) => {
        const itemBrand = (item.brand || "").toLowerCase().trim();
        return itemBrand === brandParam;
      });

      const brandToUse = matchingBrand ? matchingBrand.brand : brandFromQuery;

      if (!selectedMakes.includes(brandToUse)) {
        const updatedMakes = [...selectedMakes, brandToUse];
        dispatch(setSelectedMakes(updatedMakes));
        dispatch(applyFilters());
      }
    }
  }, [brandFromQuery, dispatch, items, selectedMakes]);

  // Apply filters after products load or selectedMakes change
  const applyProductFilters = useCallback(() => {
    if (status === "succeeded" && items.length > 0) {
      dispatch(applyFilters());
    }
  }, [dispatch, status, items.length]);

  // Effect hooks
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

  useEffect(() => {
    syncBrandWithUrl();
  }, [syncBrandWithUrl]);

  useEffect(() => {
    applyProductFilters();
  }, [applyProductFilters, selectedMakes]);

  // Reset to first page when filteredItems change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems.length]);

  // Pagination slicing
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredItems.slice(startIndex, endIndex);

  // Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(filteredItems.length / pageSize)) {
      setCurrentPage(page);
    }
  };

  // Loading spinner
  if (status === "loading" && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  // Error display
  if (status === "failed" && error) {
    return (
      <div className="text-center mt-20 text-red-600 text-xl">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-16 sm:pt-20 px-2 sm:px-4 gap-4 lg:gap-6">
      <aside className="w-full lg:w-1/4 xl:w-1/5 p-2 sm:p-4 lg:sticky lg:top-20 lg:self-start bg-white rounded-lg shadow-sm">
        <div className="lg:hidden mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => document.querySelector('aside')?.classList.toggle('hidden')}>
            Show/Hide
          </button>
        </div>
        <Filter />
      </aside>

      <main className="w-full lg:w-3/4 xl:w-4/5 p-2 sm:p-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
          Electric Cars Gallery
        </h1>
        <div className="space-y-4 sm:space-y-6">
          {filteredItems.length === 0 && status !== "loading" ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600 text-lg">
                No products found matching your criteria.
              </p>
              <button 
                onClick={() => dispatch(setSelectedMakes([]))}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <ProductCardList
              products={paginatedProducts}
              totalItems={filteredItems.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const ListPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><CircularProgress /></div>}>
      <ListContent />
    </Suspense>
  );
};

export default ListPage;
