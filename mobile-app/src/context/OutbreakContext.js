import React, { createContext, useState, useEffect } from 'react';
import { CONFIG } from '../config/config';

export const OutbreakContext = createContext();

// Base coordinates for common cities to center the random scatter
const CITY_COORDS = {
  'Pune': { latitude: 18.5204, longitude: 73.8567 },
  'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'Delhi': { latitude: 28.7041, longitude: 77.1025 },
  'Chennai': { latitude: 13.0827, longitude: 80.2707 },
  // Default to central India (Nagpur area)
  'Default': { latitude: 20.5937, longitude: 78.9629 },
};

export const OutbreakProvider = ({ children }) => {
  const [outbreakData, setOutbreakData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRiskData = async (city = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = city 
        ? `${CONFIG.API_BASE_URL}/api/risk/calculate?city=${city}`
        : `${CONFIG.API_BASE_URL}/api/risk/calculate`;

      const response = await fetch(url);


      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      if (json.success && Array.isArray(json.data)) {
        if (json.data.length === 0) {
          console.log("ℹ️ No outbreak data found - system in healthy monitoring state.");
          setOutbreakData([]);
          return;
        }

        // We need to inject random coordinates around the area/city, and generate an ID
        const processedData = json.data.map((item, index) => {
          // Use backend provided coordinates if available, otherwise fallback to city-based random scatter
          let latitude, longitude;
          
          if (item.lat && item.lng) {
            latitude = item.lat;
            longitude = item.lng;
          } else {
            const baseLocation = CITY_COORDS[item.city] || CITY_COORDS['Default'];
            
            // Random offset between -0.05 and +0.05 degrees (~5km radius) to avoid exact overlap
            // significantly reduced from 0.8 for much better accuracy if falling back
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;
            
            latitude = baseLocation.latitude + latOffset;
            longitude = baseLocation.longitude + lngOffset;
          }

          return {
            ...item,
            id: `server-${index}-${Date.now()}`,
            coordinates: {
              latitude,
              longitude,
            }
          };
        });
        
        setOutbreakData(processedData);
      } else {
        throw new Error(json.error || 'Invalid data format returned by API');
      }
    } catch (err) {
      console.warn('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const refreshData = async (city = '') => {
    await fetchRiskData(city);
  };


  const getHighRiskAreas = () => outbreakData.filter((d) => d.prediction.level === 'HIGH');
  const getMediumRiskAreas = () => outbreakData.filter((d) => d.prediction.level === 'MEDIUM');
  const getLowRiskAreas = () => outbreakData.filter((d) => d.prediction.level === 'LOW');
  
  const getStats = () => ({
    total: outbreakData.length,
    high: getHighRiskAreas().length,
    medium: getMediumRiskAreas().length,
    low: getLowRiskAreas().length,
  });

  return (
    <OutbreakContext.Provider value={{
      outbreakData,
      loading,
      error,
      refreshData,
      getHighRiskAreas,
      getMediumRiskAreas,
      getLowRiskAreas,
      getStats
    }}>
      {children}
    </OutbreakContext.Provider>
  );
};
