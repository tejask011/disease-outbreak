export default function Insights({ data }) {
  console.log("INSIGHTS DATA:", data);

  if (!data) return <div>No Data</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      
      {/* TOP STATS */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p>Avg</p>
          <h2>{data.avgLast7Days?.toFixed(2)}</h2>
        </div>

        <div>
          <p>Today</p>
          <h2>{data.todayCases}</h2>
        </div>

        <div>
          <p>Growth</p>
          <h2>{data.growthRate?.toFixed(2)}%</h2>
        </div>

        <div>
          <p>Trend</p>
          <h2>{data.trend}</h2>
        </div>
      </div>

      {/* 🔥 ALL DISEASES */}
      <div>
        <h3>🔥 Disease Trends</h3>

        {data.diseases && data.diseases.length > 0 ? (
          data.diseases.map((d, i) => (
            <div key={i}>
              {d.name} → {d.growth.toFixed(2)}%
            </div>
          ))
        ) : (
          <p>No disease data</p>
        )}
      </div>

    </div>
  );
}