"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link"; // For navigation back to products or dashboard

// Define API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventoryapiv1-367404119922.asia-southeast1.run.app";

// Define the shape of the form data based on your API requirements
type FormData = {
  BrandId: number;
  Color: string;
  Price: number;
  Model: string;
  ECurrencyType: number; // Assuming 1 for USD, adjust as needed
  Gallery: FileList; // Stays as FileList in type, but we'll access via ref
  Location: string;
  Title: string;
  IsFeatured: boolean;
  CategoryId: number;
  Condition: number; // Assuming 1 for New, 2 for Used, etc., adjust as needed
  Image: FileList; // For primary product image file
  Description: string;
  phoneNumber: string; // Phone number field
};

// --- Currency Type Options ---
const ECurrencyTypeOptions = [
  { value: 1, label: "USD ($)" },
  // Add more currency types as per your API's enum mapping if applicable
];

// --- Condition Type Options ---
const ConditionOptions = [
  { value: 1, label: "New" },
  { value: 2, label: "Used" },
  { value: 3, label: "Certified Pre-Owned" },
  // Add more conditions as per your API's enum mapping if applicable
];

const SellProductPage: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  // State for Brand and Category dropdowns
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Auth state to ensure token is checked before rendering form or fetching dropdown data
  const [authReady, setAuthReady] = useState(false);

  // Ref for the Gallery file input
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 1. Check for authentication token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No authentication token found, redirecting to login.");
      router.replace("/login"); // Use replace to prevent going back to this page without auth
      return;
    }
    setAuthReady(true); // Authentication token is present, now safe to fetch data
  }, [router]);

  // 2. Fetch Brands and Categories once authenticated
  useEffect(() => {
    if (!authReady) return; // Only fetch if auth check is complete

    const token = localStorage.getItem("token"); // Get token again for API calls (useEffect dependency)

    // Fetch Brands
    axios.get(`${API_BASE_URL}/Brand`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBrands(res.data?.data || [])) // Assuming API returns { data: [...] } for brands
      .catch(err => {
        console.error("Error fetching brands:", err);
        setMessage("Error loading brands.");
        setBrands([]);
      })
      .finally(() => setLoadingBrands(false));

    // Fetch Categories
    axios.get(`${API_BASE_URL}/Category`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setCategories(res.data?.data || [])) // Assuming API returns { data: [...] } for categories
      .catch(err => {
        console.error("Error fetching categories:", err);
        setMessage("Error loading categories.");
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));

  }, [authReady]); // Depend on authReady state

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset // To clear form after successful submission
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setMessage(null); // Clear previous messages

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication token not found. Please log in.");
      router.replace("/login"); // Redirect if token is missing during submission
      return;
    }

    const formData = new FormData();

    // Append all form fields to FormData
    formData.append("BrandId", data.BrandId.toString());
    formData.append("Color", data.Color);
    formData.append("Price", data.Price.toString());
    formData.append("Model", data.Model);
    formData.append("ECurrencyType", data.ECurrencyType.toString());
    formData.append("Location", data.Location);
    formData.append("Title", data.Title);
    formData.append("IsFeatured", data.IsFeatured.toString()); // Boolean to string
    formData.append("CategoryId", data.CategoryId.toString());
    formData.append("Condition", data.Condition.toString());
    formData.append("Description", data.Description);
    formData.append("phoneNumber", data.phoneNumber); // Append phone number

    // Append the primary product image file
    if (data.Image && data.Image.length > 0) {
      formData.append("Image", data.Image[0]); // Append the first selected file
    } else {
      setMessage("Product image (primary) is required."); // Clarified message
      return;
    }

    // Handle Gallery: append multiple files using the ref
    const galleryFiles = galleryInputRef.current?.files;
    if (galleryFiles && galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        formData.append("Gallery", galleryFiles[i]); // Append each file
      }
    }
    // No specific error message for gallery if it's optional,
    // otherwise add validation here (e.g., if (galleryFiles.length === 0) { setMessage("Gallery images are required."); return; }

    // Optional: Log FormData contents for debugging
    console.log("--- FormData contents before Axios POST ---");
    for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
            console.log(pair[0] + ': ' + pair[1].name + ' (' + pair[1].type + ')');
        } else {
            console.log(pair[0] + ': ' + pair[1]);
        }
    }
    console.log("-----------------------------------------");

    try {
      // Make the API POST request
      const response = await axios.post(
        `${API_BASE_URL}/Product`, // Your product API endpoint
        formData, // Send as FormData
        {
          headers: {
            "Authorization": `Bearer ${token}`, // Include the authentication token
            "accept": "*/*" // Accept any response type
            // The 'Content-Type' header for multipart/form-data is usually
            // handled automatically by the browser when sending FormData.
          },
        }
      );

      console.log("Product posted successfully:", response.data);
      setMessage("Product listed successfully!");
      reset(); // Clear form fields after successful submission

      // Manually clear file inputs since reset() might not clear them reliably for all browsers/cases
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      const primaryImageInput = document.getElementById('Image') as HTMLInputElement;
      if (primaryImageInput) primaryImageInput.value = '';

      // Optional: Redirect after a delay
      // setTimeout(() => router.push('/products'), 2000);

    } catch (error: unknown) {
      console.error("Error posting product:", error);
      if (axios.isAxiosError(error) && error.response) {
        // Log detailed API response for easier debugging
        console.error("API Response Data (on error):", error.response.data);
        console.error("API Response Status (on error):", error.response.status);

        if (error.response.status === 401) {
          setMessage("Error: Unauthorized. Please check your login status.");
        } else if (error.response.status === 400) {
          // Attempt to get specific error details from the backend
          const errorDetails = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data);
          setMessage(`Error: Bad Request. Please check your input data. Details: ${errorDetails}`);
        } else if (error.response.status === 500) {
          setMessage("Error: Internal Server Error. The API encountered a problem. Please contact support or check server logs.");
          if (error.response.data) {
            console.error("Server 500 Error Details:", error.response.data);
          }
        } else {
          setMessage(
            `Error: ${error.response.data.message || error.response.data.error || error.response.statusText || "Failed to list product."}`
          );
        }
      } else if (error instanceof Error) {
        setMessage(`Error: ${error.message || "An unexpected error occurred."}`);
      } else {
        setMessage("Error: An unknown error occurred during product listing.");
      }
    }
  };

  // Render loading state or null until authentication check is complete
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="max-w-xl w-full mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">List New Product</h1>

        {message && (
          <div
            className={`p-3 mb-6 rounded-lg text-sm font-medium text-center ${
              message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Title */}
          <div>
            <label htmlFor="Title" className="block text-sm font-medium text-gray-700 mb-1">
              Product Title:
            </label>
            <input
              id="Title"
              {...register("Title", { required: "Product title is required" })}
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isSubmitting}
            />
            {errors.Title && <p className="mt-1 text-red-600 text-xs">{errors.Title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">
              Description:
            </label>
            <textarea
              id="Description"
              {...register("Description", { required: "Description is required" })}
              rows={4}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isSubmitting}
            ></textarea>
            {errors.Description && <p className="mt-1 text-red-600 text-xs">{errors.Description.message}</p>}
          </div>

          {/* Model */}
          <div>
            <label htmlFor="Model" className="block text-sm font-medium text-gray-700 mb-1">
              Model:
            </label>
            <input
              id="Model"
              {...register("Model", { required: "Model is required" })}
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isSubmitting}
            />
            {errors.Model && <p className="mt-1 text-red-600 text-xs">{errors.Model.message}</p>}
          </div>

          {/* Brand Dropdown */}
          <div>
            <label htmlFor="BrandId" className="block text-sm font-medium text-gray-700 mb-1">
              Brand:
            </label>
            <select
              id="BrandId"
              {...register("BrandId", { required: "Brand is required", valueAsNumber: true })}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              defaultValue="" // Important for controlled component validation
              disabled={isSubmitting || loadingBrands}
            >
              <option value="" disabled>{loadingBrands ? "Loading brands..." : "Select a brand"}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            {errors.BrandId && <p className="mt-1 text-red-600 text-xs">{errors.BrandId.message}</p>}
          </div>

          {/* Category Dropdown */}
          <div>
            <label htmlFor="CategoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Category:
            </label>
            <select
              id="CategoryId"
              {...register("CategoryId", { required: "Category is required", valueAsNumber: true })}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              defaultValue="" // Important for controlled component validation
              disabled={isSubmitting || loadingCategories}
            >
              <option value="" disabled>{loadingCategories ? "Loading categories..." : "Select a category"}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.CategoryId && <p className="mt-1 text-red-600 text-xs">{errors.CategoryId.message}</p>}
          </div>

          {/* Color */}
          <div>
            <label htmlFor="Color" className="block text-sm font-medium text-gray-700 mb-1">
              Color:
            </label>
            <input
              id="Color"
              {...register("Color", { required: "Color is required" })}
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isSubmitting}
            />
            {errors.Color && <p className="mt-1 text-red-600 text-xs">{errors.Color.message}</p>}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="Price" className="block text-sm font-medium text-gray-700 mb-1">
              Price:
            </label>
            <input
              id="Price"
              {...register("Price", { required: "Price is required", valueAsNumber: true, min: 0 })}
              type="number"
              step="0.01" // Allow decimal values for price
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isSubmitting}
            />
            {errors.Price && <p className="mt-1 text-red-600 text-xs">{errors.Price.message}</p>}
          </div>

          {/* ECurrencyType */}
          <div>
            <label htmlFor="ECurrencyType" className="block text-sm font-medium text-gray-700 mb-1">
              Currency Type:
            </label>
            <select
              id="ECurrencyType"
              {...register("ECurrencyType", { required: "Currency type is required", valueAsNumber: true })}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              defaultValue="" // Ensure controlled component
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Currency</option>
              {ECurrencyTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.ECurrencyType && <p className="mt-1 text-red-600 text-xs">{errors.ECurrencyType.message}</p>}
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="Condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition:
            </label>
            <select
              id="Condition"
              {...register("Condition", { required: "Condition is required", valueAsNumber: true })}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              defaultValue="" // Ensure controlled component
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Condition</option>
              {ConditionOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.Condition && <p className="mt-1 text-red-600 text-xs">{errors.Condition.message}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="Location" className="block text-sm font-medium text-gray-700 mb-1">
              Location:
            </label>
            <input
              id="Location"
              {...register("Location", { required: "Location is required" })}
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isSubmitting}
            />
            {errors.Location && <p className="mt-1 text-red-600 text-xs">{errors.Location.message}</p>}
          </div>

          {/* Gallery - Multiple Image File Upload */}
          <div>
            <label htmlFor="Gallery" className="block text-sm font-medium text-gray-700 mb-1">
              Gallery Images (can select multiple files):
            </label>
            <input
              id="Gallery"
              ref={galleryInputRef} // Using useRef for direct access
              type="file"
              accept="image/*"
              multiple // Allow multiple file selection
              className="w-full text-gray-700 p-2 border border-gray-300 rounded-lg shadow-sm
                         file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                         file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100 transition-colors duration-200"
              disabled={isSubmitting}
            />
            {/* No specific error message for Gallery, as it's optional */}
          </div>

          {/* Product Image Upload (Primary) */}
          <div>
            <label htmlFor="Image" className="block text-sm font-medium text-gray-700 mb-1">
              Product Image (Primary):
            </label>
            <input
              id="Image"
              {...register("Image", { required: "Product image is required" })}
              type="file"
              accept="image/*" // Only allow image files
              className="w-full text-gray-700 p-2 border border-gray-300 rounded-lg shadow-sm
                         file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                         file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100 transition-colors duration-200"
              disabled={isSubmitting}
            />
            {errors.Image && <p className="mt-1 text-red-600 text-xs">{errors.Image.message}</p>}
          </div>

          {/* IsFeatured Checkbox */}
          <div className="flex items-center">
            <input
              id="IsFeatured"
              {...register("IsFeatured")} // Boolean checkbox
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="IsFeatured" className="ml-2 block text-sm text-gray-900">
              Feature this product
            </label>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number:
            </label>
            <input
              id="phoneNumber"
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  // Allows optional '+' then optional '0', then 1 to 14 digits
                  value: /^\+?0?\d{1,14}$/,
                  message: "Invalid phone number format (e.g., +1234567890, 0123456789, or 1234567890)."
                }
              })}
              type="text"
              placeholder="e.g., +1234567890 or 0123456789"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isSubmitting}
            />
            {errors.phoneNumber && <p className="mt-1 text-red-600 text-xs">{errors.phoneNumber.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg
                        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        transition duration-200 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Listing Product..." : "List Product"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-700">
          <Link href="/" className="text-blue-600 hover:underline font-semibold">
            Back to Product List
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SellProductPage;