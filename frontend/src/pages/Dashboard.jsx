import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import HighRiskAlerts from "../components/HighRiskAlerts";
import { MapPin, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fly to a specific location when city is searched
function FlyTo({ coords, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, zoom, { duration: 1.8 });
    }
  }, [coords, zoom, map]);

  return null;
}

// Auto-fit map bounds to show all markers
function AutoFitBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    const validItems = data.filter((d) => d.lat && d.lng);
    if (validItems.length === 0) return;

    const lats = validItems.map((d) => d.lat);
    const lngs = validItems.map((d) => d.lng);

    const bounds = [
      [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
      [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5],
    ];

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, duration: 1.5 });
  }, [data, map]);

  return null;
}

const riskColor = (level) => {
  switch (level) {
    case "HIGH": return "#ef4444";
    case "MEDIUM": return "#f59e0b";
    case "LOW": return "#22c55e";
    default: return "#3b82f6";
  }
};

export default function Dashboard() {
  const { riskData, loading, currentCity } = useOutletContext();
  const [flyCoords, setFlyCoords] = useState(null);
  const [flyZoom, setFlyZoom] = useState(5);

  useEffect(() => {
    if (!currentCity) {
      setFlyCoords(null);
      setFlyZoom(5);
      return;
    }

    const geocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(currentCity)}&countrycodes=in&format=json&limit=1`
        );
        const results = await res.json();

        if (results.length > 0) {
          setFlyCoords([
            parseFloat(results[0].lat),
            parseFloat(results[0].lon)
          ]);
          setFlyZoom(12);
        }
      } catch (err) {
        console.error("Geocode error:", err);
      }
    };

    geocode();
  }, [currentCity]);

  const data = riskData
    ? (Array.isArray(riskData) ? riskData : [riskData])
    : [];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Disease Outbreak</h1>
        <p className="text-sm text-navy-500 mt-1">Real-time monitoring & risk prediction dashboard</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={<MapPin className="w-4 h-4" />} label="Areas Monitored" value={data.length || "—"} />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="High Risk" value={data.filter(d => d.prediction?.level === "HIGH").length} />
        <StatCard icon={<Shield className="w-4 h-4" />} label="Medium Risk" value={data.filter(d => d.prediction?.level === "MEDIUM").length} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Low Risk" value={data.filter(d => d.prediction?.level === "LOW").length} />
      </div>

      {/* MAP */}
      <div className="relative">
        <div className="glass p-1.5 overflow-hidden" style={{ height: "500px" }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full" />
            </div>
          ) : (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ width: "100%", height: "100%", borderRadius: "16px" }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              
              {/* Fly to searched city if available, else auto-fit markers */}
              {flyCoords ? (
                <FlyTo coords={flyCoords} zoom={flyZoom} />
              ) : (
                <AutoFitBounds data={data} />
              )}

              {data.map((item, i) => {
                if (!item.lat || !item.lng) return null;

                const lat = item.lat;
                const lng = item.lng;

                const color = riskColor(item.prediction?.level);
                const isHigh = item.prediction?.level === "HIGH";

                return (
                  <CircleMarker
                    key={i}
                    center={[lat, lng]}
                    radius={
                      isHigh ? 16 :
                      item.prediction?.level === "MEDIUM" ? 12 : 9
                    }
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.5,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div>
                        <strong>{item.area}</strong><br />
                        {item.city}<br />
                        <b style={{ color }}>{item.prediction?.level}</b><br />
                        Disease: {item.prediction?.disease}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-5 right-5 text-xs bg-black/70 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" /> High
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" /> Medium
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" /> Low
          </div>
        </div>
      </div>

      <HighRiskAlerts riskData={riskData} />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs opacity-60">{label}</p>
      </div>
    </div>
  );
}