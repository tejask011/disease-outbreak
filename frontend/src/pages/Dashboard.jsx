import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import {
  MapPin, Activity, ShieldAlert, TrendingUp,
  AlertTriangle, Clock, Zap, ShieldCheck
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const RISK_COLOR = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
};

const badgeClass = (level) => {
  if (level === "HIGH") return "badge-high";
  if (level === "MEDIUM") return "badge-medium";
  return "badge-low";
};

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
      [Math.min(...lats) - 0.2, Math.min(...lngs) - 0.2],
      [Math.max(...lats) + 0.2, Math.max(...lngs) + 0.2],
    ];

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, duration: 1.5 });
  }, [data, map]);
  return null;
}

export default function Dashboard() {
  const { riskData, loading, currentCity } = useOutletContext();
  const [flyCoords, setFlyCoords] = useState(null);
  const [flyZoom, setFlyZoom] = useState(5);

  const data = riskData
    ? (Array.isArray(riskData) ? riskData : [riskData])
    : [];

  // Top 5 highest-risk areas
  const top5 = [...data]
    .sort((a, b) => (b.prediction?.riskScore ?? 0) - (a.prediction?.riskScore ?? 0))
    .slice(0, 5);

  const mappable = data.filter(d => d.lat && d.lng);

  useEffect(() => {
    const geocodeCity = async () => {
      if (!currentCity) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(currentCity)}&countrycodes=in&format=json&limit=1`
        );
        const results = await res.json();
        if (results.length > 0) {
          setFlyCoords([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
          setFlyZoom(12);
        }
      } catch (err) {
        console.error("Geocode error:", err);
      }
    };

    if (currentCity) {
      geocodeCity();
    } else if (mappable.length > 0) {
      // Auto-fly to first HIGH risk area or first geocoded area
      const target = mappable.find(d => d.prediction?.level === "HIGH") || mappable[0];
      if (target) {
        setFlyCoords([target.lat, target.lng]);
        setFlyZoom(mappable.length > 5 ? 7 : 10);
      }
    }
  }, [currentCity, data.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">
          Dashboard{currentCity ? ` — ${currentCity}` : ""}
        </h2>
        {!loading && (
          <span className="text-[13px] text-navy-500">
            · {data.length} area{data.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Zap className="w-4 h-4 text-blue-400" />} label="Avg Risk" value={`${Math.round(data.reduce((s, d) => s + (d.prediction?.riskScore || 0), 0) / (data.length || 1))}%`} />
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-red-400" />} label="High Risk" value={data.filter(d => d.prediction?.level === "HIGH").length} />
        <StatCard icon={<TrendingUp className="w-4 h-4 text-amber-400" />} label="Medium Risk" value={data.filter(d => d.prediction?.level === "MEDIUM").length} />
        <StatCard icon={<ShieldCheck className="w-4 h-4 text-green-400" />} label="Low Risk" value={data.filter(d => d.prediction?.level === "LOW").length} />
      </div>

      {/* Top 5 Risk Alerts */}
      {!loading && top5.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Top Critical Areas</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {top5.map((item, i) => (
              <div key={i} className="glass-subtle p-4 border-l-[3px] hover:bg-white/[0.03] transition-all" style={{ borderLeftColor: RISK_COLOR[item.prediction?.level] || "#3b82f6" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-white truncate">{item.area}</p>
                  <span className={`${badgeClass(item.prediction?.level)} px-1.5 py-0.5 text-[9px] font-bold rounded uppercase`}>
                    {item.prediction?.level}
                  </span>
                </div>
                <p className="text-[10px] text-navy-500 truncate mb-2">{item.city}</p>
                <p className="text-xs text-white capitalize">{item.prediction?.disease}</p>
                <div className="mt-2 h-1 rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full" style={{ width: `${item.prediction?.riskScore}%`, background: RISK_COLOR[item.prediction?.level] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Interactive Risk Map</h3>
        </div>
        <div className="glass p-1.5 overflow-hidden relative" style={{ height: "450px" }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-navy-900/50">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
            </div>
          ) : (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ width: "100%", height: "100%", borderRadius: "14px" }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              
              {flyCoords ? <FlyTo coords={flyCoords} zoom={flyZoom} /> : <AutoFitBounds data={data} />}

              {mappable.map((item, i) => {
                const color = RISK_COLOR[item.prediction?.level] || "#3b82f6";
                return (
                  <CircleMarker
                    key={i}
                    center={[item.lat, item.lng]}
                    radius={item.prediction?.level === "HIGH" ? 15 : 10}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2 }}
                  >
                    <Popup>
                      <div className="text-navy-900">
                        <p className="font-bold border-b pb-1 mb-1">{item.area}</p>
                        <p className="text-xs">{item.city}</p>
                        <p className="text-xs font-bold" style={{ color }}>{item.prediction?.level} RISK</p>
                        <p className="text-xs">Disease: {item.prediction?.disease}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}

          {/* Map Legend */}
          <div className="absolute bottom-6 right-6 bg-navy-900/90 backdrop-blur px-3 py-2 rounded-lg border border-white/10 text-[10px] space-y-1 z-[1000]">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> High Risk</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Risk</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Low Risk</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass p-4 flex items-center gap-4 transition-transform hover:scale-[1.02]">
      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-[10px] text-navy-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}