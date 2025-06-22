"use client";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../lib/store";
import {
  setSelectedMakes,
  setSelectedCategories,
  setSelectedConditions,
  setMinPrice,
  setMaxPrice,
  setSelectedLocations,
  setIsFeaturedFilter,
  applyFilters,
  resetFilters
} from "../lib/features/productSlice";

interface FilterSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  onClear?: () => void;
  showClear?: boolean;
}

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface PriceInputProps {
  id: string;
  label: string;
  value: number | undefined;
  min: number;
  onChange: (value: number | undefined) => void;
  placeholder: string;
}

const PriceInput: React.FC<PriceInputProps> = ({
  id,
  label,
  value,
  min,
  onChange,
  placeholder
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      id={id}
      type="number"
      min={min}
      value={value || ""}
      onChange={(e) => {
        const newValue = e.target.value ? parseFloat(e.target.value) : undefined;
        onChange(newValue);
      }}
      className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
    />
  </div>
);

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  count,
  children,
  onClear,
  showClear = false
}) => (
  <div className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-800">
        {title}
        <span className="ml-2 text-sm text-gray-500">({count})</span>
      </h3>
      {showClear && onClear && (
        <button
          onClick={onClear}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
    {children}
  </div>
);

const FilterCheckbox: React.FC<FilterCheckboxProps> = ({ id, label, checked, onChange }) => (
  <label className="flex items-center p-2 text-gray-700 cursor-pointer hover:bg-gray-50 rounded-md select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
      id={id}
    />
    <div className="flex-1 flex items-center justify-between">
      <span className="text-base">{label}</span>
      {checked && (
        <span className="ml-2 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          Selected
        </span>
      )}
    </div>
  </label>
);

const Filter = () => {
  const dispatch = useDispatch();
  const {
    items,
    selectedMakes,
    selectedCategories,
    selectedConditions,
    minPrice,
    maxPrice,
    selectedLocations,
    isFeaturedFilter,
    status,
    error
  } = useSelector((state: RootState) => state.products);

  const uniqueBrands = useMemo(
    () => Array.from(new Set(items.map(item => item.brand).filter(Boolean))).sort(),
    [items]
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(items.map(item => item.category).filter(Boolean))).sort(),
    [items]
  );

  const uniqueConditions = useMemo(
    () => Array.from(new Set(items.map(item => item.condition).filter(Boolean))).sort(),
    [items]
  );

  const uniqueLocations = useMemo(
    () => Array.from(new Set(items.map(item => item.location).filter(Boolean))).sort(),
    [items]
  );

  useEffect(() => {
    if (items.length > 0) {
      dispatch(applyFilters());
    }
  }, [items, dispatch]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col p-6 bg-white border rounded-xl shadow-lg w-full">
        <p className="text-center text-gray-600">Loading filters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col p-6 bg-white border rounded-xl shadow-lg w-full">
        <p className="text-center text-red-600">Error loading filters: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 bg-white border rounded-xl shadow-lg w-full overflow-y-auto max-h-[calc(100vh-100px)]">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Filters</h2>

      <FilterSection
        title="Brand"
        count={uniqueBrands.length}
        showClear={selectedMakes.length > 0}
        onClear={() => {
          dispatch(setSelectedMakes([]));
          dispatch(applyFilters());
        }}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {uniqueBrands.map((brand) => (
            <FilterCheckbox
              key={brand}
              id={`brand-${brand}`}
              label={brand}
              checked={selectedMakes.includes(brand)}
              onChange={(e) => {
                const newSelection = selectedMakes.includes(brand)
                  ? selectedMakes.filter(make => make !== brand)
                  : [...selectedMakes, brand];
                dispatch(setSelectedMakes(newSelection));
                dispatch(applyFilters());
              }}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Category"
        count={uniqueCategories.length}
        showClear={selectedCategories.length > 0}
        onClear={() => {
          dispatch(setSelectedCategories([]));
          dispatch(applyFilters());
        }}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {uniqueCategories.map((category) => (
            <FilterCheckbox
              key={category}
              id={`category-${category}`}
              label={category}
              checked={selectedCategories.includes(category)}
              onChange={() => {
                const newSelection = selectedCategories.includes(category)
                  ? selectedCategories.filter(cat => cat !== category)
                  : [...selectedCategories, category];
                dispatch(setSelectedCategories(newSelection));
                dispatch(applyFilters());
              }}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Condition"
        count={uniqueConditions.length}
        showClear={selectedConditions.length > 0}
        onClear={() => {
          dispatch(setSelectedConditions([]));
          dispatch(applyFilters());
        }}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {uniqueConditions.map((condition) => (
            <FilterCheckbox
              key={condition}
              id={`condition-${condition}`}
              label={condition}
              checked={selectedConditions.includes(condition)}
              onChange={() => {
                const newSelection = selectedConditions.includes(condition)
                  ? selectedConditions.filter(cond => cond !== condition)
                  : [...selectedConditions, condition];
                dispatch(setSelectedConditions(newSelection));
                dispatch(applyFilters());
              }}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Price Range"
        count={0}
        showClear={!!(minPrice || maxPrice)}
        onClear={() => {
          dispatch(setMinPrice(undefined));
          dispatch(setMaxPrice(undefined));
          dispatch(applyFilters());
        }}
      >
        <PriceInput
          id="minPrice"
          label="Min Price"
          value={minPrice}
          min={0}
          onChange={(value) => {
            dispatch(setMinPrice(value));
            dispatch(applyFilters());
          }}
          placeholder="Min price"
        />
        <PriceInput
          id="maxPrice"
          label="Max Price"
          value={maxPrice}
          min={minPrice || 0}
          onChange={(value) => {
            dispatch(setMaxPrice(value));
            dispatch(applyFilters());
          }}
          placeholder="Max price"
        />
      </FilterSection>

      <FilterSection
        title="Location"
        count={uniqueLocations.length}
        showClear={selectedLocations.length > 0}
        onClear={() => {
          dispatch(setSelectedLocations([]));
          dispatch(applyFilters());
        }}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {uniqueLocations.map((location) => (
            <FilterCheckbox
              key={location}
              id={`location-${location}`}
              label={location}
              checked={selectedLocations.includes(location)}
              onChange={() => {
                const newSelection = selectedLocations.includes(location)
                  ? selectedLocations.filter(loc => loc !== location)
                  : [...selectedLocations, location];
                dispatch(setSelectedLocations(newSelection));
                dispatch(applyFilters());
              }}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Featured"
        count={0}
        showClear={isFeaturedFilter}
        onClear={() => {
          dispatch(setIsFeaturedFilter(false));
          dispatch(applyFilters());
        }}
      >
        <FilterCheckbox
          id="featured"
          label="Show Featured Only"
          checked={isFeaturedFilter}
          onChange={() => {
            dispatch(setIsFeaturedFilter(!isFeaturedFilter));
            dispatch(applyFilters());
          }}
        />
      </FilterSection>

      {(selectedMakes.length > 0 || selectedCategories.length > 0 || selectedConditions.length > 0 ||
        selectedLocations.length > 0 || isFeaturedFilter || minPrice || maxPrice) && (
        <button
          onClick={() => {
            dispatch(resetFilters());
            dispatch(applyFilters());
          }}
          className="mt-6 w-full bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reset All Filters
        </button>
      )}
    </div>
  );
};

export default Filter;
