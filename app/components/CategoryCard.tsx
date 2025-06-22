
"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    imageUrl?: string; // Optional image URL for the category
    description?: string; // Optional description
  };
  onClick: (categoryId: string) => void; // Handler for when the card is clicked
}

const R2_BUCKET_URL = "https://pub-133f8593b35749f28fa090bc33925b31.r2.dev"; // Your R2 bucket URL

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const imageUrl = category.imageUrl
    ? category.imageUrl.startsWith("http")
      ? category.imageUrl
      : `${R2_BUCKET_URL}/${category.imageUrl}`
    : '/placeholder-category.png'; // Fallback for categories without an image

  return (
    <div
      onClick={() => onClick(category.id)}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      <div className="relative w-full h-48 sm:h-56 rounded-t-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority // Prioritize loading for initial categories
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = "/fallback-image.png"; // Fallback if the category image itself fails
            target.onerror = null; // Prevents infinite loop
          }}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {category.description}
          </p>
        )}
        {/* You can add a Link here if clicking the card should navigate, otherwise, rely on onClick */}
        {/* For now, onClick directly dispatches Redux action, which might trigger filtering */}
      </div>
    </div>
  );
};

export default CategoryCard;