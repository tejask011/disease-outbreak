import { useState } from "react";

export default function InputBar({ onSearch, onTrend }) {
  const [city, setCity] = useState("");

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <input
        placeholder="Enter City (e.g. Pune)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #334155",
          background: "#1e293b",
          color: "#fff",
          flex: 1,
        }}
      />

      <button
        onClick={() => {
          if (!city.trim()) return alert("Enter a city name");
          onSearch(city.trim());
        }}
        style={{
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        🔍 Predict Risk
      </button>
    </div>
  );
}