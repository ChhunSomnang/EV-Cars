import React from "react";
import { Filter } from "../lib/features/accessoriesSlice"; // Import the Filter type

interface FilterProps {
  categories: string[];
  brands: string[];
  filter: Filter;
  setFilter: (newFilter: Filter) => void; // Expecting a function that takes Filter
}

const AccessoriesFilter: React.FC<FilterProps> = ({
  categories,
  brands,
  filter,
  setFilter,
}) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({
      ...filter,
      category: e.target.value,
    });
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({
      ...filter,
      brand: e.target.value,
    });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      minPrice: Number(e.target.value),
    });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      maxPrice: Number(e.target.value),
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Filter</h2>
      <div className="flex gap-4">
        <select
          className="p-2 border rounded"
          value={filter.category}
          onChange={handleCategoryChange}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded"
          value={filter.brand}
          onChange={handleBrandChange}
        >
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="p-2 border rounded"
          value={filter.minPrice}
          onChange={handleMinPriceChange}
          placeholder="Min Price"
        />
        <input
          type="number"
          className="p-2 border rounded"
          value={filter.maxPrice}
          onChange={handleMaxPriceChange}
          placeholder="Max Price"
        />
      </div>
    </div>
  );
};

export default AccessoriesFilter;
