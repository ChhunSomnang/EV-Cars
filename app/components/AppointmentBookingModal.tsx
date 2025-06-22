"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface Garage {
  garage_id: number;
  garage_name: string;
  location: string;
  image: string;
  services: string[];
  cars_serviced: any[];
}

interface AppointmentBookingModalProps {
  open: boolean;
  onClose: () => void;
  garage: Garage;
}

const AppointmentBookingModal = ({ open, onClose, garage }: AppointmentBookingModalProps) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);
    
    setStartDate(minDateTime);
    
    const defaultEndDate = new Date(now);
    defaultEndDate.setHours(defaultEndDate.getHours() + 1);
    setEndDate(defaultEndDate.toISOString().slice(0, 16));
  }, []);

  const validateDates = (start: string, end: string): boolean => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const now = new Date().getTime();

    if (startTime < now) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endTime <= startTime) {
      setError('End date must be after start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Current form values:', { startDate, endDate, serviceType });

    if (!startDate || !endDate || !serviceType) {
      const missingFields = [];
      if (!startDate) missingFields.push('startDate');
      if (!endDate) missingFields.push('endDate');
      if (!serviceType) missingFields.push('serviceType');
      console.log('Validation failed - missing fields:', missingFields);
      setError("All fields are required.");
      return;
    }

    try {
      setError('');

      if (!serviceType) {
        setError('Please select a service type');
        return;
      }

      if (!startDate || !endDate) {
        setError('Please select both start and end dates');
        return;
      }

      if (!validateDates(startDate, endDate)) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to book an appointment.");
        return;
      }

      const requestBody = {
        garageId: garage.garage_id,
        serviceType: serviceType,
        startDate: new Date(startDate).toISOString().split('.')[0] + 'Z',
        endDate: new Date(endDate).toISOString().split('.')[0] + 'Z'
      };

      try {
        const response = await fetch('https://inventoryapiv1-367404119922.asia-southeast1.run.app/GarageBooking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = 'Booking failed';
          
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || `Booking failed: ${response.status} - ${response.statusText || 'Unknown error'}`;
            } catch (e) {
              errorMessage = `Booking failed: ${response.status} - ${responseText || response.statusText || 'Unknown error'}`;
            }
          }
          
          setError(errorMessage);
          return;
        }

        // Success case
        setError('');
        onClose();
    } catch (error) {
      console.error('Booking error details:', error);
      console.log('Full error object:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(error instanceof Error ? error.message : 'Failed to book appointment');
    }
    } catch (error) {
      console.error('Booking error details:', error);
      console.log('Full error object:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(error instanceof Error ? error.message : 'Failed to book appointment');
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60">
        <div className="bg-white rounded-lg shadow-lg p-6 w-max relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl font-semibold text-gray-700 hover:text-red-500"
          >
            &times;
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center text-gray-800">Book an Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Type Selection */}
            <div className="flex flex-col">
              <Label className="text-lg font-medium text-gray-700">Service Type</Label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full mt-2 p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service</option>
                {garage.services.map((service, index) => (
                  <option key={index} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="flex space-x-6">
              <div className="flex flex-col w-1/2">
                <Label className="text-lg font-medium text-gray-700">Start Date</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate) validateDates(e.target.value, endDate);
                  }}
                  className="w-full mt-2 p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col w-1/2">
                <Label className="text-lg font-medium text-gray-700">End Date</Label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (startDate) validateDates(startDate, e.target.value);
                  }}
                  className="w-full mt-2 p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:text-red-600" role="alert">
                <span className="font-medium">Error:</span> {error}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="px-5 py-2 rounded-md text-gray-700 border-2 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-5 py-2 rounded-md text-white bg-green-500 hover:bg-green-600"
              >
                Confirm Appointment
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;