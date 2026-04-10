import { useState } from "react";
import InputBar from "../components/InputBar";
import Insights from "../components/Insights";
import UploadForm from "../components/UploadForm";

export default function Dashboard() {
  const [riskData, setRiskData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch risk prediction for a city
  const fetchRisk = async (city) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:3000/api/risk/calculate?city=${city}`
      );
      const json = await res.json();
      console.log("RISK RESPONSE:", json);

      if (json.success) {
        setRiskData(json.data);
      } else {
        setRiskData(null);
        alert(json.error || "No data found");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch risk data");
    }
    setLoading(false);
  };

  // Fetch trend analysis
  const fetchTrend = async (city, disease) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:3000/api/trend?city=${city}&disease=${disease}`
      );
      const json = await res.json();
      setTrendData(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  // After CSV upload, auto-fetch risk
  const handleUploadSuccess = (cities) => {
    if (cities && cities.length > 0) {
      fetchRisk(cities[0]);
    }
  };

  return (
    <div
      style={{
        background: "#0f172a",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2>🦠 Disease Outbreak Dashboard</h2>

      <InputBar onSearch={fetchRisk} onTrend={fetchTrend} />

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* Left — Risk Results */}
        <div
          style={{
            flex: 3,
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          {loading && <p>⏳ Analyzing...</p>}

          {riskData && !loading && (
            <div>
              {/* Handle single result or array */}
              {Array.isArray(riskData) ? (
                riskData.map((r, i) => (
                  <RiskCard key={i} data={r} />
                ))
              ) : (
                <RiskCard data={riskData} />
              )}
            </div>
          )}

          {!riskData && !loading && (
            <p style={{ color: "#94a3b8" }}>
              Upload CSV or search a city to see predictions
            </p>
          )}
        </div>

        {/* Right — Upload */}
        <div
          style={{
            flex: 1,
            background: "#1e293b",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {showUpload ? "Hide" : "📄 Upload CSV"}
          </button>

          {showUpload && <UploadForm onSuccess={handleUploadSuccess} />}
        </div>
      </div>

      {/* Trend Data */}
      {trendData && (
        <div style={{ marginTop: "20px" }}>
          <Insights data={trendData} />
        </div>
      )}
    </div>
  );
}

// Risk prediction card component
function RiskCard({ data }) {
  const levelColors = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#22c55e",
  };

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "12px",
        borderLeft: `4px solid ${data.prediction?.color || "#3b82f6"}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>
          📍 {data.area}, {data.city}
        </h3>
        <span
          style={{
            background: levelColors[data.prediction?.level] || "#3b82f6",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {data.prediction?.level}
        </span>
      </div>

      <div style={{ marginTop: "10px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <small style={{ color: "#94a3b8" }}>Disease</small>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "18px" }}>
            {data.prediction?.disease}
          </p>
        </div>
        <div>
          <small style={{ color: "#94a3b8" }}>Confidence</small>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "18px" }}>
            {data.prediction?.confidence}
          </p>
        </div>
        <div>
          <small style={{ color: "#94a3b8" }}>Expected Outbreak</small>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "18px" }}>
            {data.prediction?.expectedOutbreak}
          </p>
        </div>
      </div>

      {/* Weather */}
      {data.weather && (
        <div style={{ marginTop: "10px", display: "flex", gap: "15px", color: "#94a3b8", fontSize: "13px" }}>
          <span>🌡️ {data.weather.temp}°C</span>
          <span>💧 {data.weather.humidity}%</span>
          <span>🌧️ {data.weather.rainfall}mm</span>
        </div>
      )}

      {/* Top Diseases */}
      {data.topDiseases && (
        <div style={{ marginTop: "12px" }}>
          <small style={{ color: "#94a3b8" }}>Top Diseases</small>
          <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
            {data.topDiseases.map((d, i) => (
              <span
                key={i}
                style={{
                  background: d.color || "#334155",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {d.name}: {d.probability}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <p style={{ marginTop: "10px", color: "#fbbf24", fontSize: "14px" }}>
          {data.summary}
        </p>
      )}
    </div>
  );
}