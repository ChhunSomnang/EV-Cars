'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const brandList: Brand[] = [
  { id: 1, name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png" },
  { id: 2, name: "Nissan", logo: "https://i.pinimg.com/474x/9f/1f/9f/9f1f9f97a38ce3449e267a4d38694ca0.jpg" },
  { id: 3, name: "Porsche", logo: "https://i.pinimg.com/474x/a4/8a/5c/a48a5c0213f1abcd494f733cdee2fb12.jpg" },
  { id: 4, name: "Ford", logo: "https://i.pinimg.com/474x/cd/d3/af/cdd3afb7f3acf5c4c71cfee59b239aeb.jpg" }
];

const BrandCard: React.FC<{ brand: Brand }> = ({ brand }) => {
  const router = useRouter();

  const handleBrandClick = () => {
    router.push(`/list?brand=${encodeURIComponent(brand.name)}`);
  };

  return (
    <div
      onClick={handleBrandClick}
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:cursor-pointer"
    >
      <div className="p-4 text-center">
        <img src={brand.logo} alt={brand.name} className="w-32 h-32 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-gray-800">{brand.name}</h2>
      </div>
    </div>
  );
};

const BrandList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {brandList.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
};

export default BrandList;
