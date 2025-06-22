"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../lib/features/productSlice";
import { RootState, AppDispatch } from "../lib/store";
import Link from "next/link";
import { CircularProgress } from "@mui/material";
import { HeartIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import {
  addProductToCompare,
  removeProductFromCompare,
} from "../lib/features/compareSlice";
import {
  addFavoriteProduct,
  removeFavoriteProduct,
} from "../lib/features/favoriteSlice";
import type { Product } from "../lib/features/productSlice";

const FALLBACK_PRODUCT_IMAGE = "https://placehold.co/400x256/e0e0e0/555555?text=No+Image";

const ListProduct: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.filteredItems);
  const status = useSelector((state: RootState) => state.products.status);
  const error = useSelector((state: RootState) => state.products.error);
  const selectedProductsForCompare = useSelector((state: RootState) => state.compare.selectedProducts);
  const favorites = useSelector((state: RootState) => state.favorites.favorites);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts({}));
  }, [dispatch, status]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when products change
  }, [products]);

  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center mt-4 text-red-600 text-xl p-4">
        {error ? `Error: ${error}` : "Error loading products."}
      </div>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center mt-4 text-gray-600 text-xl p-4">
        No products available or found matching current filters.
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 font-inter">
        {paginatedProducts.map((product: Product) => {
          const imageUrl = product.imgSrc || FALLBACK_PRODUCT_IMAGE;
          const isFavorite = favorites.some(fav => fav.productId === product.id);
          const isSelectedForCompare = selectedProductsForCompare.includes(product.id);

          return (
            <div
              key={product.id}
              className="relative flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute top-3 right-3 flex space-x-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFavorite) {
                      const favorite = favorites.find(f => f.productId === product.id);
                      if (favorite) {
                        dispatch(removeFavoriteProduct(favorite.favoriteId));
                      }
                    } else {
                      dispatch(addFavoriteProduct(product.id));
                    }
                  }}
                  className={`p-2 rounded-full bg-white shadow-md ${
                    isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                  } transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isFavorite ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isSelectedForCompare
                      ? dispatch(removeProductFromCompare(product.id))
                      : dispatch(addProductToCompare(product.id));
                  }}
                  className={`p-2 rounded-full bg-white shadow-md ${
                    isSelectedForCompare
                      ? "bg-blue-500 text-white focus:ring-blue-500"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300 focus:ring-gray-400"
                  } transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  title="Compare Product"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  src={imageUrl}
                  alt={product.title || "Product Image"}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src === FALLBACK_PRODUCT_IMAGE) return;
                    target.src = FALLBACK_PRODUCT_IMAGE;
                    target.onerror = null;
                  }}
                />
              </div>

              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.vendor} - {product.model}
                  </p>
                  <p className="text-xl font-extrabold text-blue-600 mb-2">
                    {`${product.price.toLocaleString()} ${product.eCurrencyType}`}
                  </p>
                  <div className="text-sm text-gray-700 space-y-1 mb-2">
                    <p><strong>Condition:</strong> {product.condition}</p>
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Location:</strong> {product.location}</p>
                    <p><strong>Phone:</strong> {product.phoneNumber}</p>
                  </div>
                </div>
                <Link href={`/product/${product.id}`} className="mt-auto block">
                  <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-2 py-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* See More Link */}
      <div className="flex justify-center pb-8">
        <Link href="/list" className="text-blue-600 hover:text-blue-800 font-semibold text-lg flex items-center gap-2 group">
          See More
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </>
  );
};

export default ListProduct;
