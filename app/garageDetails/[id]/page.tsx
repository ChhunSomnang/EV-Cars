'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AppointmentBookingModal from 'app/components/AppointmentBookingModal';
import { getImageUrl } from '../../../imageService';
import { Skeleton } from '@mui/material';

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
  imageUrl?: string;
}

interface ApiResponse {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  data: Garage[];
}

const GarageDetails = () => {
  const params = useParams();
  const garage_id = Number(params?.id);
  const [garage, setGarage] = useState<Garage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchGarageDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!garage_id || isNaN(garage_id)) {
          throw new Error("Invalid Garage ID. Please check the URL and try again.");
        }

        const response = await fetch("https://inventoryapiv1-367404119922.asia-southeast1.run.app/Garage", {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Garage not found.");
          if (response.status === 403) throw new Error("Access denied.");
          throw new Error(`Failed to fetch garage data: ${response.statusText}`);
        }

        const apiResponse: ApiResponse = await response.json();

        if (!Array.isArray(apiResponse.data)) {
          throw new Error("Invalid data format.");
        }

        const selectedGarage = apiResponse.data.find((g) => g.id === garage_id);
        if (!selectedGarage) throw new Error("Garage not found.");

        setGarage(selectedGarage);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGarageDetails();
  }, [garage_id]);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-lg font-semibold text-gray-700">{rating}/5</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
          <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-5" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M6.938 4h10.124c1.54 0 2.502 1.667 1.732 3L13.732 20c-.77 1.333-2.694 1.333-3.464 0L3.34 7c-.77-1.333.192-3 1.732-3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!garage) {
    return <div className="text-center text-gray-600 p-10">No garage data found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">{garage.garageName}</h1>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{garage.garageName}</h2>
          {renderStars(garage.rating)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Location</h3>
              <p className="text-gray-600">{garage.location}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Type</h3>
              <p className="text-gray-600">{garage.garageService}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Price Range</h3>
              <p className="text-gray-600">{garage.priceRange}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Info</h3>
              <p className="text-gray-600">{garage.contactInfo}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Operating Hours</h3>
              <p className="text-gray-600">{garage.operatingHours}</p>
            </div>
            
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Garage Image</h3>
          <div className="h-64 rounded-lg overflow-hidden bg-gray-100">
            {garage.imageUrl ? (
              <img
                src={getImageUrl(garage.imageUrl)}
                alt={garage.garageName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
          <Button
            onClick={() => window.open(`https://www.google.com/maps?q=${garage.latitude},${garage.longitude}`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Open in Google Maps
          </Button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p><span className="font-semibold">Managed by:</span> {garage.user}</p>
            <p><span className="font-semibold">Garage ID:</span> {garage.id}</p>
          </div>
        </div>

        <Button
          onClick={handleOpenModal}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 text-lg font-semibold"
        >
          Book Appointment
        </Button>
      </div>

      {isModalOpen && (
        <AppointmentBookingModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          garage={{
            garage_id: garage.id,
            garage_name: garage.garageName,
            location: garage.location,
            image: garage.imageUrl || '',
            services: garage.garageService.split(',').map(s => s.trim()),
            cars_serviced: [],
          }}
        />
      )}
    </div>
  );
};

export default GarageDetails;