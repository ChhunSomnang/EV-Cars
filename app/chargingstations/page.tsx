"use client";
import { useState, useEffect } from "react";
import ChargingStation from "../components/ChargingStation/ChargingStation";
import { TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { API_ENDPOINTS } from '../lib/constants';

const MapPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAddress, setSearchAddress] = useState("");



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAddress(searchQuery);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Charging Stations</h1>
          {/* Add Station button hidden */}
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
          />
          <IconButton type="submit" color="primary" aria-label="search">
            <SearchIcon />
          </IconButton>
        </form>

        <div className="rounded-lg overflow-hidden">
          <ChargingStation searchAddress={searchAddress} />
        </div>
      </div>
    </div>
  );
};

export default MapPage;