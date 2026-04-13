











"use client";

import React, { useLayoutEffect, useState } from "react";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewAllVehicleBody = () => {
  const [allVehicle, setAllVehicle] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function getAllVehicle() {
    const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/all-vehicle`;
    const params = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    try {
      setLoading(true);
      const response = await fetch(API, params).then((res) => res.json());
      console.log("Vehicle API Response:", response);

      if (response.status === "success") {
        // Make sure data is always an array
        const vehiclesArray = Array.isArray(response.data) ? response.data : [];
        setAllVehicle(vehiclesArray);
        setHasFetched(true);
        toast.success("Vehicles fetched successfully!");
      } else {
        setAllVehicle([]);
        toast.error(response.message || "Failed to fetch vehicles.");
      }
    } catch (err) {
      console.error(err);
      setAllVehicle([]);
      toast.error("Failed to fetch vehicle data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useLayoutEffect(() => {
    if (!hasFetched) getAllVehicle();
  }, [hasFetched]);

  return (
    <main className="container my-4">
      <h1 className="text-center mb-4">View All Vehicles</h1>

      <div className="text-center mb-3">
        <button className="btn btn-warning" onClick={getAllVehicle} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {loading && <p className="text-center">Loading data...</p>}

      <div
        className="table-responsive shadow-lg p-3 mb-5 bg-white rounded"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Number</th>
              <th>Weight (kg)</th>
              <th>Fuel Capacity (L)</th>
              <th>Status</th>
              <th>Route</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(allVehicle) && allVehicle.length > 0 ? (
              allVehicle.map((vehicle, index) => (
                <tr key={vehicle._id || index}>
                  <td>{index + 1}</td>
                  <td>{vehicle.name || "N/A"}</td>
                  <td>{vehicle.number || "N/A"}</td>
                  <td>{vehicle.weight || "N/A"}</td>
                  <td>{vehicle.fuelCapacity || "N/A"}</td>
                  <td>{vehicle.status || "IDLE"}</td>
                  <td>{vehicle.routeId || "Not Assigned"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  {loading ? "Loading..." : "No vehicles found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default ViewAllVehicleBody;
