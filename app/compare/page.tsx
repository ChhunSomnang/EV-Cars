"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../lib/store";
import { fetchProducts } from "../lib/features/productSlice";
import Link from "next/link";
import { removeProductFromCompare, clearCompareList } from "../lib/features/compareSlice";
import { CircularProgress } from "@mui/material";

interface ProductProperty {
  name: string;
  values: Array<{
    value: string;
  }>;
}

const ComparePage: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedProducts, error: compareError, maxProducts } = useSelector((state: RootState) => state.compare);
  const products = useSelector((state: RootState) => state.products.items);
  const status = useSelector((state: RootState) => state.products.status);

  useEffect(() => {
    dispatch(fetchProducts() as any );
  }, [dispatch]);

  const comparedProducts = products.filter((p) =>
    selectedProducts.some((id) => String(id) === String(p.id))
  );

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (comparedProducts.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-600 text-xl">
        No products selected for comparison.
        <Link href="/" className="text-blue-600 underline block mt-4">
          Go back to products
        </Link>
      </div>
    );
  }

  // Get all unique property names
  const allProperties = Array.from(
    new Set(
      comparedProducts.flatMap(product => 
        ((product as any).properties || []).map((prop: { name: any; }) => prop.name)
      )
    )
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Comparison</h1>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all products?")) {
              dispatch(clearCompareList());
            }
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
        >
          Clear All
        </button>
      </div>

      {/* Error Message */}
      {compareError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{compareError}</span>
        </div>
      )}

      {/* Compare Status */}
      <div className="mb-6 text-sm text-gray-600">
        Comparing {comparedProducts.length} of {maxProducts} products
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {comparedProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(removeProductFromCompare(product.id));
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-300 z-10"
              title="Remove Product"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-64 relative">
              <img
                className="w-full h-full object-cover"
                src={product.imgSrc || "/fallback-image.png"}
                alt={product.name}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = "/fallback-image.png";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
              <p className="mt-2 text-gray-600">Vendor: {product.vendor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              {comparedProducts.map((product) => (
                <th key={product.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Basic Details */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Model</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.model || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Brand</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.brand || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Price</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.price ? `${product.eCurrencyType} ${product.price.toLocaleString()}` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Condition</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.condition || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Color</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.color || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Location</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.location || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Contact Number</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.phoneNumber || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Featured</td>
              {comparedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 whitespace-nowrap">
                  {product.isFeatured ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Standard
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Dynamic Properties */}
            {allProperties.map((propertyName) => (
              <tr key={propertyName}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {propertyName}
                </td>
                {comparedProducts.map((product) => {
                  const property = (product as any).properties?.find((p: { name: any; }) => p.name === propertyName);
                  return (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {property?.values[0]?.value || 'N/A'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;