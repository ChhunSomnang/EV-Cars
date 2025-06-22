"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { addToCart } from "app/lib/features/store/cartSlice";

import type { Product } from '../../lib/features/productSlice';
import { fetchProducts } from '../../lib/features/productSlice';
import { RootState, AppDispatch } from '../../lib/store';

const FALLBACK_PRODUCT_IMAGE = "https://placehold.co/800x600/e0e0e0/555555?text=No+Image";

const ProductDetail = () => {
  const params = useParams();
  const productId = params?.id ? parseInt(params.id as string, 10) : null;

  const dispatch: AppDispatch = useDispatch();
  const { items: products, status, error: fetchError } = useSelector((state: RootState) => state.products);

  const [currentMainImage, setCurrentMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, status]);

  const product = useMemo(() => {
    if (productId === null || isNaN(productId)) {
      return null;
    }
    return products.find(p => p.id === productId) || null;
  }, [products, productId]);

  useEffect(() => {
    if (product) {
      setCurrentMainImage(product.imgSrc || (product.gallery && product.gallery[0]) || FALLBACK_PRODUCT_IMAGE);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    const cartItemId = typeof product.id === 'number' ? product.id.toString() : product.id;
    dispatch(addToCart({
      id: cartItemId,
      title: product.title,
      price: product.price,
      image: currentMainImage || FALLBACK_PRODUCT_IMAGE,
      quantity: 1,
    }));
    console.log(`${product.title} added to cart!`);
  };

  const renderMessage = (message: string, isError: boolean = false) => (
    <div className={`text-center mt-20 p-6 rounded-lg shadow-md max-w-md mx-auto ${isError ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
      <p className="text-lg font-medium mb-4">{message}</p>
      <button onClick={() => window.history.back()} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300">
        Go Back
      </button>
    </div>
  );

  if (status === 'loading' || product === undefined) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-700">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading product details...
      </div>
    );
  }

  if (status === 'failed' && fetchError) {
    return renderMessage(fetchError, true);
  }

  if (!product) {
    return renderMessage("Product not found.", false);
  }

  // Prepare gallery images (may be a single string with commas, or already an array)
  const galleryImages: string[] = (product.gallery && Array.isArray(product.gallery))
    ? product.gallery.flatMap(img =>
        typeof img === "string"
          ? img.split(",").map(s => s.trim()).filter(Boolean)
          : []
      )
    : [];

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-4 md:px-8 bg-gray-100 font-inter">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-7xl w-full flex flex-col lg:flex-row gap-10">
        {/* Product Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="relative w-full h-96 border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
            <Image
                src={currentMainImage || FALLBACK_PRODUCT_IMAGE}
                alt={product.title || "Product Image"}
                fill
                style={{objectFit: "cover"}}
                className="transition-transform duration-500 ease-in-out hover:scale-110"
                onError={() => {
                  setCurrentMainImage(FALLBACK_PRODUCT_IMAGE);
                }}
            />
          </div>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {galleryImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMainImage(imgUrl)}
                  className={`relative h-24 rounded-lg overflow-hidden border-2 ${
                    currentMainImage === imgUrl ? 'border-blue-500 shadow-md' : 'border-gray-200'
                  } hover:border-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    fill
                    style={{objectFit: "cover"}}
                    className="transition-transform duration-200 hover:scale-105"
                    onError={() => setCurrentMainImage(FALLBACK_PRODUCT_IMAGE)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col">   
         <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {product.title}
          </h1>

          <p className="text-2xl font-bold text-blue-600 mt-8">
            {product.price.toLocaleString()} {product.eCurrencyType}
          </p>

          <div className="border-t border-b border-gray-200 py-6 space-y-4">
            <p className="text-lg text-gray-800 leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-base text-gray-700">
              {product.model && <p><strong>Model:</strong> {product.model}</p>}
              {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
              {product.category && <p><strong>Category:</strong> {product.category}</p>}
              {product.color && <p><strong>Color:</strong> {product.color}</p>}
              {product.condition && <p><strong>Condition:</strong> {product.condition}</p>}
              {product.location && <p><strong>Location:</strong> {product.location}</p>}
              {product.phoneNumber && <p><strong>Phone:</strong> {product.phoneNumber}</p>}
              
            </div>
          </div>

         

          <div className="flex justify-center mt-6">
            <Link href="/" className="text-blue-600 hover:underline text-lg font-medium">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;