"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { fetchAccessories } from '../../lib/features/accessoriesSlice';
import { addToCart } from '../../lib/features/store/cartSlice';
import { CircularProgress } from '@mui/material';
import { useParams } from 'next/navigation';
import Image from 'next/image';

const AccessoryDetailPage = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { accessories, loading, error } = useSelector((state: RootState) => state.accessories);
  
  const R2_BUCKET_URL = "https://pub-133f8593b35749f28fa090bc33925b31.r2.dev";

  useEffect(() => {
    dispatch(fetchAccessories() as any );
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  const accessory = accessories.find(item => item.id === Number(params.id));

  if (!accessory) {
    return (
      <div className="text-center p-4">
        Accessory not found
      </div>
    );
  }

  const imageUrl = accessory.image.startsWith("http")
    ? accessory.image
    : `${R2_BUCKET_URL}/${accessory.image}`;

  const handleAddToCart = () => {
    const cartItem = {
      id: accessory.id.toString(),
      title: accessory.name,
      price: accessory.price,
      image: accessory.image.startsWith("http")
        ? accessory.image
        : `${R2_BUCKET_URL}/${accessory.image}`,
      quantity: 1,
    };

    dispatch(addToCart(cartItem));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative aspect-square w-3/4 mx-auto rounded-lg overflow-hidden shadow-lg">
          <Image
            src={imageUrl}
            alt={accessory.name}
            fill
            className="object-contain"
            priority
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = "/fallback-image.png";
            }}
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{accessory.name}</h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">
              Brand: {accessory.brand}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              Category: {accessory.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">
              Rating: {accessory.rating}
            </span>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.floor(accessory.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>

          <div className="text-2xl font-bold text-blue-600">
            ${accessory.price.toFixed(2)}
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessoryDetailPage;