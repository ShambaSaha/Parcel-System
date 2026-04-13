import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const GPSData = () => {
  const [gpsData, setGpsData] = useState({ latitude: "Loading...", longitude: "Loading..." });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGPSData = async () => {
      const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/gps-data`;
      try {
        setLoading(true);
        const response = await fetch(API);
        const data = await response.json();
        if (data.status === "success" && data.data.latitude && data.data.longitude) {
          setGpsData({
            latitude: data.data.latitude.toFixed(6),
            longitude: data.data.longitude.toFixed(6),
          });
        } else {
          toast.warning("GPS data unavailable");
          setGpsData({ latitude: "Unavailable", longitude: "Unavailable" });
        }
      } catch (error) {
        toast.error("Failed to fetch GPS data");
        setGpsData({ latitude: "Error", longitude: "Error" });
      } finally {
        setLoading(false);
      }
    };
    const interval = setInterval(fetchGPSData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="container my-4">
      <div className="card shadow p-4 bg-light">
        <h1 className="text-danger mb-4">📍 GPS Data Viewer</h1>
        <div className="mb-3">
          <label className="form-label fw-bold">Latitude</label>
          <div className="form-control bg-white">{gpsData.latitude}</div>
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Longitude</label>
          <div className="form-control bg-white">{gpsData.longitude}</div>
        </div>
        {loading && <div className="text-warning">Fetching location...</div>}
      </div>
    </main>
  );
};

export default GPSData;