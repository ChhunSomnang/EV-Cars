"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../lib/store";
import { fetchProducts } from "../lib/features/productSlice";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { removeFavoriteProduct, fetchUserFavorites } from "../lib/features/favoriteSlice";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import {
  addProductToCompare,
  removeProductFromCompare,
} from "../lib/features/compareSlice";
import { CircularProgress } from "@mui/material";

const R2_BUCKET_URL = "https://pub-133f8593b35749f28fa090bc33925b31.r2.dev";

const FavoritePage = () => {
  const dispatch = useDispatch();
  
  // Redux state selectors
  const products = useSelector((state: RootState) => state.products.items);
  const productsStatus = useSelector((state: RootState) => state.products.status);
  const favorites = useSelector((state: RootState) => state.favorites.favorites);
  const favoriteStatus = useSelector((state: RootState) => state.favorites.status);
  const favoriteError = useSelector((state: RootState) => state.favorites.error);
  const compareProducts = useSelector((state: RootState) => state.compare.selectedProducts);

  useEffect(() => {
    if (productsStatus === 'idle') {
      dispatch(fetchProducts({}) as any);
    }
  }, [dispatch, productsStatus]);

  useEffect(() => {
    dispatch(fetchUserFavorites() as any);
  }, [dispatch]);

  // Handle removing product from favorites
  const handleRemoveFavorite = async (productId: number) => {
    try {
      const favorite = favorites.find(f => f.productId === productId);
      if (favorite) {
        await dispatch(removeFavoriteProduct(favorite.favoriteId) as any);
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  // Handle compare list toggle
  const handleCompareToggle = (productId: number) => {
    if (compareProducts.includes(productId)) {
      dispatch(removeProductFromCompare(productId));
    } else {
      dispatch(addProductToCompare(productId));
    }
  };

  // Loading state
  if (productsStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  // Filter products to show only favorited ones
  const favoriteProducts = products.filter((product) =>
    favorites.some((favorite) => favorite.productId === product.id)
  );

  // Empty state
  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <HeartIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">
          No Favorite Products
        </h1>
        <p className="text-gray-600 mb-6">
          You haven't added any products to your favorites yet.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Favorite Products</h1>
      
      {/* Error message */}
      {favoriteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {favoriteError}
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favoriteProducts.map((product) => {
          const imageUrl = product.imgSrc?.startsWith("http")
            ? product.imgSrc
            : `${R2_BUCKET_URL}/${product.imgSrc}`;

          const isInCompare = compareProducts.includes(product.id);

          return (
            <div
              key={product.id}
              className="relative flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform duration-300 hover:scale-105"
            >
              {/* Product image */}
              <Link href={`/product/${product.id}`}>
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              </Link>

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(product.id);
                }}
                disabled={favoriteStatus === 'loading'}
                className={`absolute top-4 right-16 p-2 rounded-full bg-white shadow-md text-red-500 transition-colors duration-300 ${favoriteStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'}`}
                title="Remove from Favorites"
              >
                {favoriteStatus === 'loading' ? (
                  <CircularProgress size={20} />
                ) : (
                  <HeartSolid className="w-5 h-5" />
                )}
              </button>

              {/* Compare button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompareToggle(product.id);
                }}
                className={`absolute top-4 right-4 p-2 rounded-full bg-white shadow-md transition-colors duration-300 ${isInCompare ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}
                title={isInCompare ? "Remove from Compare" : "Add to Compare"}
              >
                <ArrowsRightLeftIcon className="w-5 h-5" />
              </button>

              {/* Product details */}
              <div className="p-4 flex-grow">
                <Link href={`/product/${product.id}`}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors duration-300">
                    {product.title}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <p className="text-xl font-bold text-blue-600">${product.price}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritePage;