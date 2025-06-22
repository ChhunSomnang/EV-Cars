import { useEffect, useState } from "react";
import ChargingStationBookingModal from "./ChargingStationBookingModal";
import { API_ENDPOINTS } from "../../lib/constants";

interface ChargingStationProps {
  searchAddress: string;
}

interface ApiStation {
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

interface MapStation {
  id: number;
  name: string;
  address: string;
  status: "Available" | "Busy";
  position: [number, number];
}

interface Filters {
  availability: "all" | "available" | "busy";
  type: string;
  minPower: number;
  maxPower: number;
}

const ChargingStation: React.FC<ChargingStationProps> = ({ searchAddress }) => {
  const [stations, setStations] = useState<ApiStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ApiStation[]>([]);
  const [mapStations, setMapStations] = useState<MapStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<MapStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedStationForBooking, setSelectedStationForBooking] = useState<ApiStation | null>(null);
  const [filters, setFilters] = useState<Filters>({
    availability: "all",
    type: "all",
    minPower: 0,
    maxPower: 1000
  });
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://inventoryapiv1-367404119922.asia-southeast1.run.app/User/MyProfile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${text}`);
        }
      })
      .then(data => {
        if (data && typeof data.userType === 'string') {
          setIsAdminUser(data.userType === 'Admin');
        } else {
          console.warn('Unexpected user data format:', data);
          setIsAdminUser(false);
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        setIsAdminUser(false);
      });
    } else {
      setIsAdminUser(false);
    }
  }, []);

  const resetForm = () => {
    setFormData(new FormData());
    setIsModalOpen(false);
  };

  const handlePostStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requiredFields = ['Name', 'Type', 'PowerValue', 'PricePerKwh', 'Location', 'MapLink'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          setError(`${field} is required`);
          return;
        }
      }

      const response = await fetch(
        'https://inventoryapiv1-367404119922.asia-southeast1.run.app/ChargingStation',
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setStations(prevStations => [...prevStations, result.data]);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to post charging station");
      console.error("Error posting station:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = new FormData();
    formData.forEach((value, key) => newFormData.append(key, value));
    if (e.target.type === 'checkbox') {
      newFormData.set(e.target.name, e.target.checked.toString());
    } else {
      newFormData.set(e.target.name, e.target.value);
    }
    setFormData(newFormData);
  };

  const getCoordinatesFromShortUrl = async (shortUrl: string): Promise<[number, number]> => {
    const defaultCoords: [number, number] = [11.562108, 104.888535];
    
    if (!shortUrl) {
      return defaultCoords;
    }

    try {
      const timestamp = Date.now();
      const apiUrl = `/api/coordinates?url=${encodeURIComponent(shortUrl)}&t=${timestamp}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.warn(`Failed to fetch coordinates: ${response.status}`);
        return defaultCoords;
      }

      const data = await response.json();
      
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        return [data.lat, data.lng];
      }

      return defaultCoords;
    } catch (error) {
      console.warn('Error fetching coordinates:', error);
      return defaultCoords;
    }
  };

  const convertToMapStation = async (apiStation: ApiStation): Promise<MapStation> => {
    const defaultPosition: [number, number] = [11.562108, 104.888535];
    
    return {
      id: apiStation.id,
      name: apiStation.name,
      address: apiStation.location,
      status: apiStation.availability ? "Available" : "Busy",
      position: defaultPosition
    };
  };

  const handleBookAppointment = (station: ApiStation) => {
    console.log('handleBookAppointment called with:', station);
    console.log('Before setting state - bookingModalOpen:', bookingModalOpen);
    console.log('Before setting state - selectedStationForBooking:', selectedStationForBooking);
    
    setSelectedStationForBooking(station);
    setBookingModalOpen(true);
    
    console.log('Modal should be open now');
    
    // Add a small delay to check state after React updates
    setTimeout(() => {
      console.log('After state update - bookingModalOpen should be true');
    }, 100);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedStationForBooking(null);
  };

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://inventoryapiv1-367404119922.asia-southeast1.run.app/ChargingStation'
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const apiStations = result.data;
        setStations(apiStations);
        
        const convertedStations = await Promise.all(apiStations.map(convertToMapStation));
        setMapStations(convertedStations);
      } catch (error) {
        setError("Failed to load charging stations");
        console.error("Error fetching stations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = stations;

      if (filters.availability !== "all") {
        filtered = filtered.filter(station =>
          filters.availability === "available" ? station.availability : !station.availability
        );
      }

      if (filters.type !== "all") {
        filtered = filtered.filter(station =>
          station.type === filters.type
        );
      }

      filtered = filtered.filter(station =>
        station.powerValue >= filters.minPower &&
        station.powerValue <= filters.maxPower
      );

      if (searchAddress) {
        filtered = filtered.filter((station) =>
          station.location.toLowerCase().includes(searchAddress.toLowerCase())
        );
      }

      setFilteredStations(filtered);
    };

    applyFilters();
  }, [stations, filters, searchAddress]);

  useEffect(() => {
    const updateFilteredStations = async () => {
      if (searchAddress) {
        const filtered = stations.filter((station) =>
          station.location.toLowerCase().includes(searchAddress.toLowerCase())
        );
        const convertedStations = await Promise.all(filtered.map(convertToMapStation));
        setMapStations(convertedStations);
        setSelectedStation(null);
      } else {
        const convertedStations = await Promise.all(stations.map(convertToMapStation));
        setMapStations(convertedStations);
      }
    };
    updateFilteredStations();
  }, [stations, searchAddress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <div className="text-xl text-gray-600">Loading stations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Available Stations</h2>
          {isAdminUser && (
            <a
              href="/chargingstations/create"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Station
            </a>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="border rounded-lg px-3 py-2"
            value={filters.availability}
            onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value as "all" | "available" | "busy" }))}
          >
            <option value="all">All Stations</option>
            <option value="available">Available Only</option>
            <option value="busy">Busy Only</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="all">All Types</option>
            {Array.from(new Set(stations.map(s => s.type))).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Min Power"
              value={filters.minPower}
              onChange={(e) => setFilters(prev => ({ ...prev, minPower: Number(e.target.value) }))}
            />
            <span>kW</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Max Power"
              value={filters.maxPower}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPower: Number(e.target.value) }))}
            />
            <span>kW</span>
          </div>
        </div>

        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
          {filteredStations.map((station) => (
            <div 
              key={station.id} 
              className={`border p-5 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                selectedStation?.id === station.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
              }`}
              onClick={async () => {
                const convertedStation = await convertToMapStation(station);
                setSelectedStation(convertedStation);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={station.imageUrl.startsWith('http') ? station.imageUrl : `https://pub-133f8593b35749f28fa090bc33925b31.r2.dev/${station.imageUrl}`} 
                    alt={station.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://pub-133f8593b35749f28fa090bc33925b31.r2.dev/charging-station-placeholder.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-gray-900 truncate">{station.name}</h3>
                    <div className="flex gap-2">
                      <a
                        href={station.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        View on Maps
                      </a>
                      <button
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                          station.availability
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!station.availability}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (station.availability) {
                            handleBookAppointment(station);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Book Session
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mb-3 truncate">{station.location}</p>
                  <div className="flex items-center mb-3">
                    <span className="text-gray-700 font-medium">Status: </span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        station.availability
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {station.availability ? "Available" : "Busy"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-gray-700">
                    <p><span className="font-medium">Type:</span> {station.type}</p>
                    <p><span className="font-medium">Power:</span> {station.powerValue}kW</p>
                    <p><span className="font-medium">Price:</span> ${station.pricePerKwh}/kWh</p>
                    <p><span className="font-medium">Distance:</span> {station.distanceInKm}km</p>
                    <p className="col-span-2"><span className="font-medium">Rating:</span> {station.rating}/5</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
{/* Modal for booking */}
{selectedStationForBooking && (
  <ChargingStationBookingModal
    open={bookingModalOpen}
    onClose={closeBookingModal}
    station={selectedStationForBooking}
  />
)}
    </div>
  );
};

export default ChargingStation;