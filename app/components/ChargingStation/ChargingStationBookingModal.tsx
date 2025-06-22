import React, { useState } from "react";

interface ChargingStation {
  id: number;
  name: string;
  type: string;
  capacity: string;
  powerValue: number;
  pricePerKwh: number;
  distanceInKm: number;
  rating: number;
  availability: boolean;
  location: string;
  mapLink: string;
  connectorTypes: string[];
  imageUrl: string;
}

interface ChargingStationBookingModalProps {
  open: boolean;
  onClose: () => void;
  station: ChargingStation;
}

const ChargingStationBookingModal: React.FC<ChargingStationBookingModalProps> = ({
  open,
  onClose,
  station,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [error, setError] = useState("");

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const durationOptions = [
    { value: "0.5", label: "30 minutes" },
    { value: "1", label: "1 hour" },
    { value: "1.5", label: "1.5 hours" },
    { value: "2", label: "2 hours" },
    { value: "3", label: "3 hours" },
    { value: "4", label: "4 hours" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDate || !selectedTime || !phoneNumber || !vehicleModel) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate appointment date and time
    const now = new Date();
    const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    
    if (appointmentDateTime < now) {
      setError("Please select a future date and time.");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 9 or 10-digit phone number.");
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required. Please log in first.");
        return;
      }

      const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}:00.000Z`);
      
      const appointmentData = {
        chargingStationId: station.id,
        appointmentDate: appointmentDateTime.toISOString()
      };
      
      // Add debugging to see what station.id actually is
      console.log('Station ID being sent:', station.id);
      console.log('Station object:', station);
      console.log('Booking appointment:', appointmentData);
      
      console.log('Sending request with token:', token);
      console.log('Request payload:', appointmentData);

      const response = await fetch('https://inventoryapiv1-367404119922.asia-southeast1.run.app/ChargingAppointment', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData)
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
          return;
        }
        if (response.status === 500) {
          setError("Server error. Please try again later or contact support.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}\nResponse: ${responseText}`);
      }

      let result;
      try {
        result = responseText ? JSON.parse(responseText) : { success: true };
        console.log('Parsed response:', result);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        console.log('Raw response:', responseText);
        if (response.ok) {
          // If status is OK but response isn't JSON, assume success
          result = { success: true };
        } else {
          setError('Invalid response from server. Please try again.');
          return;
        }
      }
      
      console.log('Booking successful:', result);
      
      const estimatedCost = (station.pricePerKwh * parseFloat(duration) * 50).toFixed(2);
      
      alert(`Appointment booked successfully!\nStation: ${station.name}\nDate: ${selectedDate}\nTime: ${selectedTime}\nDuration: ${duration} hour(s)\nEstimated Cost: $${estimatedCost}`);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      setError("Failed to book appointment. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Book Charging Session</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <p className="text-center text-gray-600 mb-6">
          {station.name} - {station.type} ({station.powerValue}kW)
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Select Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose time slot</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Charging Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="space-y-1">
                <input
                  type="tel"
                  pattern="[0-9]{9,10}"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setPhoneNumber(value);
                  }}
                  placeholder="Enter 9-10 digit phone number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${phoneNumber.length >= 9 ? 'border-green-500' : 'border-gray-300'}`}
                  required
                  title="Please enter a valid 9-10 digit phone number"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Format: 9-10 digits</span>
                  <span className={`${phoneNumber.length >= 9 ? 'text-green-500' : 'text-gray-500'}`}>
                    {phoneNumber.length}/9-10 digits
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Vehicle Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g., Tesla Model 3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Cost Estimation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cost Estimation</h3>
            <div className="space-y-1 text-gray-600">
              <p>Duration: {duration} hour(s)</p>
              <p>Rate: ${station.pricePerKwh}/kWh</p>
              <p>Estimated Power: 50 kWh</p>
              <p className="text-xl font-bold text-green-600">
                Total: ${(station.pricePerKwh * parseFloat(duration) * 50).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChargingStationBookingModal;
