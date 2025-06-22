"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // Import useCallback
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios"; // Import axios for image upload

// Define API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventoryapiv1-367404119922.asia-southeast1.run.app";
// Define a fallback image URL for profiles
const FALLBACK_PROFILE_IMAGE = "https://placehold.co/128x128/cccccc/333333?text=No+Image";

interface UserData {
  username: string;
  userType: string;
  profile: string; // This should be the path or identifier for the profile image
}

export default function UserProfileDisplay() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the image upload modal
  const [showEditProfileImageModal, setShowEditProfileImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadImageMessage, setUploadImageMessage] = useState<string | null>(null); // Message for the image modal
  const [isImageUploading, setIsImageUploading] = useState(false); // Loading state for image modal upload
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input in modal

  // State for the profile details modal (NEW)
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [editedUsername, setEditedUsername] = useState<string>(""); // State for username input in modal
  const [updateDetailsMessage, setUpdateDetailsMessage] = useState<string | null>(null); // Message for details modal
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false); // Loading state for details modal

  // Effect to fetch user profile data when the component mounts or after an image update
  // Wrapped in useCallback to ensure stable function reference for useEffect dependency
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No authentication token found, redirecting to login.");
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/User/MyProfile`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API response error: ${response.status} - ${errorBody}`);
        throw new Error(`Failed to fetch profile: ${response.status} - ${errorBody}`);
      }

      const data: UserData = await response.json();
      console.log("Fetched user data:", data);
      setUserData(data);
      // Initialize editedUsername when profile data is fetched
      setEditedUsername(data.username);
    } catch (err: unknown) { // Use unknown for better type safety
      console.error('Error fetching user profile:', err);
      if (err instanceof Error) { // Type guard for Error instances
        setError(err.message || 'Failed to load profile data. Please try again.');
      } else {
        setError('Failed to load profile data. An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]); // Dependencies for fetchUserProfile: router is a stable reference from Next.js

  // useEffect now depends on the memoized fetchUserProfile function
  useEffect(() => {
    fetchUserProfile(); // Initial fetch when component mounts
  }, [fetchUserProfile]); // Dependency array now includes fetchUserProfile

  // Handle file selection in the image modal, wrapped in useCallback
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadImageMessage(null); // Clear any previous messages in the modal
    } else {
      setSelectedFile(null);
    }
  }, []); // No dependencies as setters are stable

  // Handle the image upload process within the modal, wrapped in useCallback
  const handleImageUpload = useCallback(async () => {
    if (!selectedFile) {
      setUploadImageMessage("Please select an image file to upload.");
      return;
    }

    setIsImageUploading(true);
    setUploadImageMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setUploadImageMessage("Authentication token not found. Please log in.");
      setIsImageUploading(false);
      router.push("/login");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Profile", selectedFile);

      const response = await axios.post(
        `${API_BASE_URL}/User/UpdateProfile`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );

      console.log("Profile image update successful:", response.data);
      setUploadImageMessage("Profile image updated successfully!");
      setSelectedFile(null); // Clear selected file
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input visually
      }
      // Re-fetch user profile data to display the newly updated image
      await fetchUserProfile();
      // Close the modal after a short delay
      setTimeout(() => setShowEditProfileImageModal(false), 1500);

    } catch (error: unknown) { // Use unknown for better type safety
      console.error("Error updating profile image:", error);
      if (axios.isAxiosError(error) && error.response) { // Type guard for Axios errors
        setUploadImageMessage(
          `Error: ${error.response.data.message || error.response.data.error || "Failed to update profile image."}`
        );
      } else if (error instanceof Error) { // Type guard for generic Error instances
        setUploadImageMessage(`Error: ${error.message || "An unexpected error occurred."}`); 
      } else {
        setUploadImageMessage("Error: An unknown error occurred during image upload.");
      }
    } finally {
      setIsImageUploading(false);
    }
  }, [selectedFile, router, fetchUserProfile]); // Dependencies for handleImageUpload

  // Handle update user details (username) - NEW FUNCTION
  const handleUpdateUserDetails = useCallback(async () => {
    if (!editedUsername || editedUsername.trim() === "") {
      setUpdateDetailsMessage("Username cannot be empty.");
      return;
    }
    // Check if username has actually changed to avoid unnecessary API calls
    if (userData?.username === editedUsername.trim()) {
      setUpdateDetailsMessage("No changes to username detected.");
      return;
    }

    setIsUpdatingDetails(true);
    setUpdateDetailsMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setUpdateDetailsMessage("Authentication token not found. Please log in.");
      setIsUpdatingDetails(false);
      router.push("/login");
      return;
    }

    try {
      // API call for updating username
      const response = await axios.put( // Assuming PUT method for update
        `${API_BASE_URL}/User/Update`, // Your API endpoint for updating username
        { username: editedUsername.trim() }, // Send only the new username in JSON body
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      console.log("Profile details update successful:", response.data);
      setUpdateDetailsMessage("Username updated successfully!");
      // Re-fetch user profile data to display the newly updated username
      await fetchUserProfile();
      // Close the modal after a short delay
      setTimeout(() => setShowEditDetailsModal(false), 1500);

    } catch (error: unknown) {
      console.error("Error updating user details:", error);
      if (axios.isAxiosError(error) && error.response) {
        setUpdateDetailsMessage(
          `Error: ${error.response.data.message || error.response.data.error || "Failed to update username."}`
        );
      } else if (error instanceof Error) {
        setUpdateDetailsMessage(`Error: ${error.message || "An unexpected error occurred."}`);
      } else {
        setUpdateDetailsMessage("Error: An unknown error occurred during username update.");
      }
    } finally {
      setIsUpdatingDetails(false);
    }
  }, [editedUsername, userData?.username, router, fetchUserProfile]); // Dependencies for handleUpdateUserDetails


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-4 bg-white rounded-lg shadow-md">
          <p className="text-lg font-semibold text-red-600 mb-2">
            Error: {error || 'User profile could not be loaded.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const profileImageSrc = userData.profile
    ? `https://pub-133f8593b35749f28fa090bc33925b31.r2.dev/${userData.profile}`
    : FALLBACK_PROFILE_IMAGE;

  return (
    <div className="container mx-auto px-4 py-8 mt-16 font-inter">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
          {/* Profile Image Section */}
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-sky-500 shadow-md flex-shrink-0">
            <img
              src={profileImageSrc}
              alt={`${userData.username}'s profile`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_PROFILE_IMAGE;
                e.currentTarget.onerror = null;
              }}
            />
          </div>
          {/* User Details Section */}
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{userData.username}</h1>
            <p className="text-gray-600 text-lg mb-4">{userData.userType}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => setShowEditProfileImageModal(true)} 
            className="flex-1 bg-sky-500 text-white py-3 px-6 rounded-lg font-semibold
                       hover:bg-sky-600 transition-colors duration-200 ease-in-out transform hover:scale-105 shadow-md"
          >
            Edit Profile Image
          </button>
          <button
            onClick={() => setShowEditDetailsModal(true)}
            className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold
                       hover:bg-blue-600 transition-colors duration-200 ease-in-out transform hover:scale-105 shadow-md"
          >
            Edit Profile Details
          </button>
          <button
            onClick={() => router.push('/orders')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold
                       hover:bg-gray-300 transition-colors duration-200 ease-in-out transform hover:scale-105 shadow-md"
          >
            View Orders
          </button>
        </div>
      </div>

      {/* Profile Image Edit Modal */}
      {showEditProfileImageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm relative">
            <button
              onClick={() => {
                setShowEditProfileImageModal(false);
                setSelectedFile(null); // Clear selected file on close
                setUploadImageMessage(null); // Clear message on close
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""; // Clear file input visually
                }
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Update Profile Image</h2>

            {uploadImageMessage && (
              <div
                className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${
                  uploadImageMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
                role="alert"
              >
                {uploadImageMessage}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="modalProfileImageInput" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Select New Image:
              </label>
              <input
                id="modalProfileImageInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="w-full text-gray-700 p-2 border border-gray-300 rounded-lg shadow-sm
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100 transition-colors duration-200 ease-in-out"
                disabled={isImageUploading}
              />
              {selectedFile && (
                <p className="mt-3 text-sm text-gray-600 text-left">Selected: {selectedFile.name}</p>
              )}
            </div>

            <button
              onClick={handleImageUpload}
              disabled={!selectedFile || isImageUploading}
              className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition duration-200 ease-in-out transform hover:scale-105
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isImageUploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>
      )}

      {/* Profile Details Edit Modal (NEW) */}
      {showEditDetailsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm relative">
            <button
              onClick={() => {
                setShowEditDetailsModal(false);
                setUpdateDetailsMessage(null); // Clear message on close
                setEditedUsername(userData?.username || ""); // Reset username to current profile value
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profile Details</h2>

            {updateDetailsMessage && (
              <div
                className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${
                  updateDetailsMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
                role="alert"
              >
                {updateDetailsMessage}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="editUsernameInput" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Username:
              </label>
              <input
                id="editUsernameInput"
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                disabled={isUpdatingDetails}
              />
            </div>

            <button
              onClick={handleUpdateUserDetails}
              disabled={isUpdatingDetails || (editedUsername.trim() === userData?.username)} // Disable if no change or updating
              className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition duration-200 ease-in-out transform hover:scale-105
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdatingDetails ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

