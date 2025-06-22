'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FormElements extends HTMLFormControlsCollection {
  Name: HTMLInputElement;
  Type: HTMLSelectElement;
  Capacity: HTMLInputElement;
  PowerValue: HTMLInputElement;
  PricePerKwh: HTMLInputElement;
  DistanceInKm: HTMLInputElement;
  Rating: HTMLInputElement;
  Availability: HTMLInputElement;
  Location: HTMLInputElement;
  MapLink: HTMLInputElement;
  ConnectorTypes: HTMLInputElement;
  ImageUrl: HTMLInputElement;
}

interface ChargingStationForm extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function CreateChargingStation() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<ChargingStationForm>) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const form = e.currentTarget;
      const formData = new FormData();

      // Add all form fields to FormData
      formData.append('Name', form.elements.Name.value);
      formData.append('Type', form.elements.Type.value);
      formData.append('Capacity', form.elements.Capacity.value);
      formData.append('PowerValue', form.elements.PowerValue.value);
      formData.append('PricePerKwh', form.elements.PricePerKwh.value);
      formData.append('DistanceInKm', form.elements.DistanceInKm.value);
      formData.append('Rating', form.elements.Rating.value);
      formData.append('Availability', form.elements.Availability.checked.toString());
      formData.append('Location', form.elements.Location.value);
      formData.append('MapLink', form.elements.MapLink.value);
      formData.append('ConnectorTypes', form.elements.ConnectorTypes.value);

      // Handle file upload
      const imageFile = form.elements.ImageUrl.files?.[0];
      if (imageFile) {
        formData.append('ImageUrl', imageFile);
      }

      const response = await fetch('https://inventoryapiv1-367404119922.asia-southeast1.run.app/ChargingStation', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/chargingstations');
        router.refresh();
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create charging station");
      console.error("Error creating charging station:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Charging Station</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Charging station created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="Name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="Name"
              id="Name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="Type" className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="Type"
              id="Type"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Fast">Fast</option>
              <option value="Slow">Slow</option>
            </select>
          </div>

          <div>
            <label htmlFor="Capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="text"
              name="Capacity"
              id="Capacity"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="PowerValue" className="block text-sm font-medium text-gray-700">Power Value</label>
            <input
              type="number"
              name="PowerValue"
              id="PowerValue"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="PricePerKwh" className="block text-sm font-medium text-gray-700">Price Per kWh</label>
            <input
              type="number"
              name="PricePerKwh"
              id="PricePerKwh"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="DistanceInKm" className="block text-sm font-medium text-gray-700">Distance (km)</label>
            <input
              type="number"
              name="DistanceInKm"
              id="DistanceInKm"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="Rating" className="block text-sm font-medium text-gray-700">Rating</label>
            <input
              type="number"
              name="Rating"
              id="Rating"
              min="1"
              max="5"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="Availability"
              id="Availability"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="Availability" className="ml-2 block text-sm text-gray-700">Available</label>
          </div>

          <div>
            <label htmlFor="Location" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="Location"
              id="Location"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="MapLink" className="block text-sm font-medium text-gray-700">Map Link</label>
            <input
              type="url"
              name="MapLink"
              id="MapLink"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="ConnectorTypes" className="block text-sm font-medium text-gray-700">Connector Types</label>
            <input
              type="text"
              name="ConnectorTypes"
              id="ConnectorTypes"
              required
              placeholder="Type 1, Type 2, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="ImageUrl" className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              name="ImageUrl"
              id="ImageUrl"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}