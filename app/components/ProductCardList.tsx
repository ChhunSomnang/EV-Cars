"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { RootState, AppDispatch } from "../lib/store";
import { addFavoriteProduct, removeFavoriteProduct } from "../lib/features/favoriteSlice";
import { isAuthenticated } from "../lib/auth";
import {
  addProductToCompare,
  removeProductFromCompare,
} from "../lib/features/compareSlice";
import type { Product } from "../lib/features/productSlice";

const FALLBACK_PRODUCT_IMAGE = "https://placehold.co/400x256/e0e0e0/555555?text=No+Image";

interface ProductCardListProps {
  products: Product[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const ProductCardList: React.FC<ProductCardListProps> = ({
  products,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.favorites);
  const selectedProductsForCompare = useSelector(
    (state: RootState) => state.compare.selectedProducts
  );

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (products.length === 0) {
    return <p className="text-center text-gray-600">No products found matching filters.</p>;
  }

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-2 sm:p-4">
        {products.map((product) => {
          const imageUrl = product.image || FALLBACK_PRODUCT_IMAGE;
          const isFavorite = favorites.some((fav) => fav.productId === product.id);
          const isSelectedForCompare = selectedProductsForCompare.includes(product.id);

          return (
            <div
              key={product.id}
              className="relative flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-1"
            >
              {/* Favorite & Compare Buttons */}
              <div className="absolute top-3 right-3 flex space-x-2 z-10">
                {/* Favorite */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthenticated()) {
                      alert("Please log in to manage favorites");
                      return;
                    }
                    isFavorite
                      ? dispatch(removeFavoriteProduct(product.id))
                      : dispatch(addFavoriteProduct(product.id));
                  }}
                  className={`p-2 rounded-full bg-white shadow-md ${
                    isFavorite ? "text-red-500" : "text-gray-400 hover:text-gray-600"
                  } transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isFavorite ? (
                    <HeartSolid className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </button>

                {/* Compare */}
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

              {/* Image */}
              <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden group">
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                  quality={75}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src === FALLBACK_PRODUCT_IMAGE) return;
                    target.src = FALLBACK_PRODUCT_IMAGE;
                    target.onerror = null;
                  }}
                />
              </div>

              {/* Details */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.brand} - {product.model}
                  </p>
                  <p className="text-xl font-extrabold text-blue-600 mb-2">
                    {`${product.eCurrencyType}${product.price.toLocaleString()}`}
                  </p>
                  <div className="text-sm text-gray-700 space-y-1 mb-4">
                    <p>
                      <strong>Condition:</strong> {product.condition}
                    </p>
                    <p>
                      <strong>Category:</strong> {product.category}
                    </p>
                    <p>
                      <strong>Location:</strong> {product.location}
                    </p>
                    <p>
                      <strong>Color:</strong> {product.color}
                    </p>
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
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pb-6 sm:pb-8 px-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-md transition-colors ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg transition-all duration-200 ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md transition-colors ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductCardList;
