import React from 'react';

// TypeScript interface for product
interface Product {
  id: number;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  rating: number;
}

// Mock product data with discounts
const specialOffers: Product[] = [
  {
    id: 1,
    name: "Model S",
    originalPrice: 79990,
    discountedPrice: 74990,
    image: "https://media.ed.edmunds-media.com/tesla/model-s/2024/oem/2024_tesla_model-s_sedan_plaid_fq_oem_1_1600.jpg",
    rating: 4,
  },
  {
    id: 2,
    name: "Model X",
    originalPrice: 89990,
    discountedPrice: 85990,
    image: "https://hips.hearstapps.com/hmg-prod/images/2020-tesla-model-x-107-656e381e755b3.jpg?crop=0.662xw:0.540xh;0.167xw,0.264xh&resize=980:*",
    rating: 5,
  },
  {
    id: 3,
    name: "Model 3",
    originalPrice: 49990,
    discountedPrice: 47990,
    image: "https://media.ed.edmunds-media.com/tesla/model-3/2024/oem/2024_tesla_model-3_sedan_base_fq_oem_1_1600.jpg",
    rating: 4,
  },
];

// Product Card Component with Special Offer Badge
const SpecialOfferCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="relative flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform duration-300 hover:scale-105">
      <img
        className="w-full h-48 object-cover"
        src={product.image}
        alt={product.name}
      />

      <div className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          
          <div className="mt-2">
            <p className="text-red-600 font-semibold">${product.discountedPrice.toLocaleString()}</p>
            <p className="line-through text-gray-500">${product.originalPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center mt-2">
          {[...Array(product.rating)].map((_, index) => (
            <svg
              key={index}
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927a1 1 0 011.902 0l1.398 3.732a1 1 0 00.9.664l3.646.308a1 1 0 01.591 1.77l-2.77 2.14a1 1 0 00-.322 1.02l1.017 3.774a1 1 0 01-1.516 1.096l-3.171-2.1a1 1 0 00-1.112 0l-3.171 2.1a1 1 0 01-1.516-1.096l1.017-3.774a1 1 0 00-.322-1.02l-2.77-2.14a1 1 0 01.591-1.77l3.646-.308a1 1 0 00.9-.664l1.398-3.732z" />
            </svg>
          ))}
        </div>

        <button className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300">
          View Offer
        </button>
      </div>

      {/* Special Offer Badge */}
      <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
        Special Offer
      </div>
    </div>
  );
};

// Special Offers List Component
const SpecialOffers: React.FC = () => {
  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {specialOffers.map((product) => (
          <SpecialOfferCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SpecialOffers;
