"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateGarageModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface GarageFormData {
  garageName: string;
  location: string;
  phoneNumber: string;
  contactInfo: string;
  operatingHours: string;
  priceRange: string;
  rating: number;
  garageService: number;
  latitude: number;
  longitude: number;
  mapLink: string;
}

interface ImageUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

const CreateGarageModal = ({ open, onClose, onSuccess }: CreateGarageModalProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageState, setImageState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    error: null,
  });

  const [formData, setFormData] = useState<GarageFormData>({
    garageName: "",
    location: "",
    phoneNumber: "",
    contactInfo: "",
    operatingHours: "",
    priceRange: "",
    rating: 0,
    garageService: 0,
    latitude: 0,
    longitude: 0,
    mapLink: "",
  });

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setImageState((prev) => ({ ...prev, error: "Please select a valid image file" }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageState({
          file,
          preview: reader.result as string,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ["rating", "latitude", "longitude", "garageService"].includes(name)
          ? parseFloat(value) || 0
          : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.garageName || !formData.location) {
      setError("Garage name and location are required.");
      return;
    }

    if (!imageState.file) {
      setError("Please choose an image.");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in.");
        router.push("/login");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("GarageName", formData.garageName);
      formDataToSend.append("Location", formData.location);
      formDataToSend.append("PhoneNumber", formData.phoneNumber);
      formDataToSend.append("ContactInfo", formData.contactInfo);
      formDataToSend.append("OperatingHours", formData.operatingHours);
      formDataToSend.append("PriceRange", formData.priceRange);
      formDataToSend.append("GarageService", formData.garageService.toString());
      formDataToSend.append("Latitude", formData.latitude.toString());
      formDataToSend.append("Longitude", formData.longitude.toString());
      formDataToSend.append("MapLink", formData.mapLink);
      formDataToSend.append("ImageUrl", imageState.file); // file sent directly

      const response = await fetch("https://inventoryapiv1-367404119922.asia-southeast1.run.app/Garage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      setFormData({
        garageName: "",
        location: "",
        phoneNumber: "",
        contactInfo: "",
        operatingHours: "",
        priceRange: "",
        rating: 0,
        garageService: 0,
        latitude: 0,
        longitude: 0,
        mapLink: "",
      });

      setImageState({ file: null, preview: null, error: null });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create garage");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl font-semibold text-gray-700 hover:text-red-500"
          >
            &times;
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center text-gray-800">Add New Garage</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField id="garageName" label="Garage Name*" value={formData.garageName} onChange={handleChange} />
              <InputField id="location" label="Location*" value={formData.location} onChange={handleChange} />
              <InputField id="contactInfo" label="Contact Info" value={formData.contactInfo} onChange={handleChange} />
              <InputField id="phoneNumber" label="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
              <InputField id="operatingHours" label="Operating Hours" value={formData.operatingHours} onChange={handleChange} />
              <InputField id="priceRange" label="Price Range" value={formData.priceRange} onChange={handleChange} />
              <InputField id="rating" label="Rating (0-5)" type="number" value={formData.rating} onChange={handleChange} />
              <InputField id="garageService" label="Garage Service Type" type="number" value={formData.garageService} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField id="latitude" label="Latitude" type="number" value={formData.latitude} onChange={handleChange} />
              <InputField id="longitude" label="Longitude" type="number" value={formData.longitude} onChange={handleChange} />
              <InputField id="mapLink" label="Map Link" value={formData.mapLink} onChange={handleChange} />

              {/* Image Upload */}
              <div className="flex flex-col">
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">Garage Image*</Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Choose Image
                  </Button>
                </div>
                {imageState.preview && (
                  <img src={imageState.preview} alt="Preview" className="mt-2 max-w-xs h-auto rounded-lg shadow" />
                )}
                {imageState.error && (
                  <p className="text-red-600 text-sm mt-1">{imageState.error}</p>
                )}
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" onClick={onClose} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 text-white hover:bg-blue-700">
                {isLoading ? "Creating..." : "Create Garage"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</Label>
    <Input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1"
    />
  </div>
);

export default CreateGarageModal;
