import { useState } from "react";
import { Search, Droplets, Thermometer, CloudRain } from "lucide-react";

export default function TopBar({ onSearch, weatherData }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const weather = weatherData || null;

  return (
    <header className="sticky top-0 z-40 h-[72px] w-full
      flex items-center justify-between gap-6 
      px-8 bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/[0.05]
      transition-all duration-300"
    >
      
      {/* Spacer to keep weather aligned strictly to right */}
      <div className="flex-1"></div>

      {/* Weather */}
      {weather && (
        <div className="glass-light px-5 py-2.5 flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-sm text-white">{weather.temp}°C</span>
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm text-white">{weather.humidity}%</span>
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          <div className="flex items-center gap-2">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-sm text-white">{weather.rainfall}mm</span>
          </div>
        </div>
      )}
    </header>
  );
}