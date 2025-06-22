"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateGarageModal from "../components/CreateGarageModal";
import { getImageUrl } from "../../imageService";

interface Garage {
  id: number;
  garageName: string;
  location: string;
  rating: number;
  garageService: string;
  priceRange: string;
  contactInfo: string;
  operatingHours: string;
  user: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  mapLink: string;
}

interface ApiResponse {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  data: Garage[];
}

const Garage = () => {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventoryapiv1-367404119922.asia-southeast1.run.app"}/User/MyProfile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User profile data:', userData);
          setIsAdminUser(userData.userType === 'Admin');
          console.log('Is admin user:', userData.userType === 'Admin');
        } else {
          console.error('Failed to fetch profile:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdminStatus();
  }, []);

  const fetchGarages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://inventoryapiv1-367404119922.asia-southeast1.run.app/Garage");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const apiResponse: ApiResponse = await response.json();

      if (Array.isArray(apiResponse.data)) {
        setGarages(apiResponse.data);
      } else {
        console.error("API did not return an array:", apiResponse);
        setGarages([]);
        setError("No garages available.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGarages();
  }, []);

  const filteredGarages = useMemo(() => {
    return filter
      ? garages.filter(
          (garage) =>
            garage.garageName.toLowerCase().includes(filter.toLowerCase()) ||
            garage.location.toLowerCase().includes(filter.toLowerCase())
        )
      : garages;
  }, [filter, garages]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 ${
              index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Our Garages
      </h1>
      
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by garage name or location..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
        {isAdminUser && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Add New Garage
          </Button>
        )}
      </div>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGarages.length > 0 ? (
            filteredGarages.map((garage) => (
              <div
                key={garage.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {garage.imageUrl && (
                  <div className="mb-4 relative h-48 w-full overflow-hidden rounded-lg">
                    <img
                      src={getImageUrl(garage.imageUrl)}
                      alt={garage.garageName}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {garage.garageName}
                  </h2>
                  {renderStars(garage.rating)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold">Location:</span> {garage.location}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Service:</span> {garage.garageService}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Price Range:</span> {garage.priceRange}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Contact:</span> {garage.contactInfo}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Hours:</span> {garage.operatingHours}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Coordinates:</span> {garage.latitude}, {garage.longitude}
                  </p>
                  {garage.mapLink && (
                    <p className="text-gray-600">
                      <span className="font-semibold">Map:</span>{" "}
                      <a
                        href={garage.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View on Map
                      </a>
                    </p>
                  )}
                </div>
                
                <div className="mt-4">
                  <Link
                    href={`/garageDetails/${garage.id}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">
              {error || "No garages available."}
            </p>
          )}
        </div>
      )}
      
      {/* Create Garage Modal */}
      <CreateGarageModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchGarages}
      />
    </div>
  );
};

export default Garage;