import { useState } from "react";

export default function UploadForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a CSV file first");

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload response:", data);

      if (data.success) {
        alert(`✅ Uploaded ${data.count} records`);
        // Notify parent with cities found
        if (onSuccess) onSuccess(data.cities);
      } else {
        alert("❌ Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed — is the backend running?");
    }

    setUploading(false);
  };

  return (
    <div style={{ marginTop: "12px" }}>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: "8px", width: "100%" }}
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          background: uploading ? "#64748b" : "#22c55e",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: uploading ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {uploading ? "⏳ Uploading..." : "📤 Upload CSV"}
      </button>
    </div>
  );
}