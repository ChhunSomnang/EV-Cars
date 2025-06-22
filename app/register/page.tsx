"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter for redirection

// Define API base URL from environment variable
// Ensure this environment variable (NEXT_PUBLIC_API_BASE_URL) is set in your .env.local file
// Example: NEXT_PUBLIC_API_BASE_URL="https://inventoryapiv1-367404119922.asia-southeast1.run.app"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventoryapiv1-367404119922.asia-southeast1.run.app";

type FormData = {
  username: string;
  password: string;
  confirmPassword: string; // Used for client-side password confirmation
  sub: string; // Corresponds to 'sub' in your API payload, labeled as 'Affiliate Code' in UI
};

const RegisterPage = () => {
  const [message, setMessage] = useState("");
  const router = useRouter(); // Initialize useRouter for navigation
  const {
    register,
    handleSubmit,
    watch, // Used to watch the value of the 'password' field for validation
    formState: { errors, isSubmitting }, // Destructure form state for errors and submission status
  } = useForm<FormData>();

  const password = watch("password"); // Get the current value of the password field

  // Function to handle form submission
  const onSubmit = async (data: FormData) => {
    setMessage(""); // Clear any previous messages

    try {
      // Send registration data to your API
      const response = await axios.post(
        `${API_BASE_URL}/User/Register`, // Construct the full API endpoint
        {
          username: data.username, // API expects 'username'
          password: data.password, // API expects 'password'
          sub: data.sub,           // API expects 'sub'
        },
        {
          headers: {
            "Content-Type": "application/json", // Specify content type as JSON
            "Accept": "*/*",                  // Accept any response type
          },
        }
      );

      console.log("Registration successful response:", response.data); // Log successful response

      setMessage(`Registration successful! User ID: ${response.data.userId}. Redirecting to login...`);
      // Redirect to the login page after a short delay for user to read the message
      setTimeout(() => {
        router.push("/login");
      }, 2000); // 2-second delay
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // If it's an Axios error with a response from the server
        const apiError = error.response.data;
        console.error("API error during registration:", apiError);
        // Prioritize specific error messages from the API response
        setMessage(
          `Error: ${apiError.error || apiError.message || error.response.statusText || "Registration failed."}`
        );
      } else if (error instanceof Error) {
        // If it's a generic JavaScript Error object
        console.error("Client-side error during registration:", error.message);
        setMessage(`Error: ${error.message || "An unexpected error occurred."}`);
      } else {
        // Fallback for any other unknown error types
        console.error("Unknown error during registration:", error);
        setMessage("Error: An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      {/* Container for the registration form */}
      <div className="max-w-md w-full mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">User Registration</h1>

        {/* Message display for success or error */}
        {message && (
          <div
            className={`p-3 mb-4 rounded-lg text-center text-sm font-medium ${
              message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
            role="alert" // Added for accessibility
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username:
            </label>
            <input
              id="username"
              {...register("username", { required: "Username is required" })}
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              disabled={isSubmitting} // Disable during form submission
            />
            {errors.username && (
              <p className="mt-1 text-red-600 text-xs">{errors.username.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password:
            </label>
            <input
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type="password"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="mt-1 text-red-600 text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password:
            </label>
            <input
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                // Custom validation to check if it matches the password field
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              type="password"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-red-600 text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Affiliate Code Input (Optional) */}
          <div>
            <label htmlFor="affiliateCode" className="block text-sm font-medium text-gray-700 mb-1">
              Affiliate Code (Optional):
            </label>
            <input
              id="affiliateCode"
              {...register("sub")} // No 'required' validation, as per API structure being optional
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              disabled={isSubmitting}
            />
             {/* No error message display for 'sub' as it's optional and has no validation rules here */}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting} // Disable button when form is submitting
            className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Link to Login Page */}
        <p className="mt-6 text-center text-gray-700">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;