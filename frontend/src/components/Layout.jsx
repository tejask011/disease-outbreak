import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const API = "http://127.0.0.1:3000";

export default function Layout() {
  const [riskData, setRiskData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState("");

  const fetchRisk = async (city = "") => {
    setLoading(true);
    setCurrentCity(city);

    try {
      const url = city
        ? `${API}/api/risk/calculate?city=${city}`
        : `${API}/api/risk/calculate`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setRiskData(json.data);

        if (json.data?.[0]?.weather) {
          setWeatherData(json.data[0].weather);
        } else {
          setWeatherData(null);
        }
      } else {
        setRiskData(null);
        setWeatherData(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setRiskData(null);
    }

    setLoading(false);
  };

  // ✅ LOAD ALL DATA ON START
  useEffect(() => {
    fetchRisk(); // 🔥 no city → all data
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0b1120]">

      <Sidebar />

      <main
        style={{ paddingLeft: "72px" }}
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"
      >
        <TopBar onSearch={fetchRisk} weatherData={weatherData} />

        <div className="flex-1 px-6 py-6">
          <div className="w-full px-2 sm:px-4 lg:px-6">
            <Outlet
              context={{
                riskData,
                weatherData,
                loading,
                currentCity,
                fetchRisk,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}