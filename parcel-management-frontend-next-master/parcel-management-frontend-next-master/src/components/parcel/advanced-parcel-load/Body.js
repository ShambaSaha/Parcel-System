








"use client";

import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

import AllParcelsTable from "./AllParcelsTable";
import AllTruckBox from "./AllTruckBox";
import { Parcel, TruckLoadOptimizer } from "@/lib/TruckPackageOptimizer";

// 👇 3D must be dynamically imported in Next.js
const TruckVolume3D = dynamic(
  () => import("../../../lib/TruckVolume3D"),
  { ssr: false }
);

const AdvancedParcelLoadBody = () => {
  const [allParcel, setAllParcel] = useState([]);
  const [allTrucks, setAllTrucks] = useState([]);
  const [hasFetchedParcels, setHasFetchedParcels] = useState(false);
  const [hasFetchedTrucks, setHasFetchedTrucks] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /* ==========================
      DERIVED STATE
  ========================== */

  const selectedParcels = useMemo(
    () => allParcel.filter(p => p.status === "selected"),
    [allParcel]
  );

  /* ==========================
      VOLUME CALCULATIONS
  ========================== */

  const maxVolume = selectedVehicle
    ? selectedVehicle.volume.length *
      selectedVehicle.volume.breadth *
      selectedVehicle.volume.height
    : 0;

  const usedVolume = selectedParcels.reduce(
    (sum, p) =>
      sum +
      p.dimensions.length *
        p.dimensions.breadth *
        p.dimensions.height,
    0
  );

  const usagePercent = maxVolume
    ? Math.round((usedVolume / maxVolume) * 100)
    : 0;

  /* ==========================
      API CALLS
  ========================== */

  async function getAllParcel() {
    try {
      const res = await fetch(
        `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/all-parcel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      ).then(r => r.json());

      if (res.status === "success") {
        setAllParcel(
          res.data.map(p => ({ ...p, status: "not-selected" }))
        );
        setHasFetchedParcels(true);
        toast.success("Parcels fetched");
      }
    } catch {
      toast.error("Parcel fetch failed");
    }
  }

  async function getAllTruck() {
    try {
      const res = await fetch(
        `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/all-vehicle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      ).then(r => r.json());

      if (res.status === "success") {
        setAllTrucks(res.data);
        setHasFetchedTrucks(true);
        toast.success("Trucks fetched");
      }
    } catch {
      toast.error("Truck fetch failed");
    }
  }

  async function sendVehicleToDelivery() {
  if (!selectedVehicle) {
    toast.error("No vehicle selected");
    return;
  }

  if (selectedParcels.length === 0) {
    toast.error("No parcels loaded");
    return;
  }

  try {
    const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/send-to-delivery`;

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: selectedVehicle._id })
    }).then(r => r.json());

    if (res.status === "success") {
      toast.success("Vehicle sent to delivery 🚚");

      // Optional UX reset
      setSelectedVehicle(null);
      setAllParcel(prev =>
        prev.map(p => ({ ...p, status: "not-selected" }))
      );
    } else {
      toast.error(res.message);
    }
  } catch {
    toast.error("Failed to send vehicle to delivery");
  }
}


  /* ==========================
      OPTIMIZATION
  ========================== */

  function calculateOptimalLoad() {
    if (!selectedVehicle) return;

    const truck = new TruckLoadOptimizer(
      selectedVehicle.volume.length,
      selectedVehicle.volume.breadth,
      selectedVehicle.volume.height
    );

    const parcels = allParcel.map(
      p =>
        new Parcel(
          p._id,
          p.dimensions.length,
          p.dimensions.breadth,
          p.dimensions.height
        )
    );

    const result = truck.optimizeLoading(parcels);

    markParcels(result.loadedParcels);
  }

  function markParcels(loadedParcels) {
    const loadedIds = loadedParcels.map(p => String(p.id));

    setAllParcel(prev =>
      prev.map(item => ({
        ...item,
        status: loadedIds.includes(String(item._id))
          ? "selected"
          : "not-selected"
      }))
    );
  }

  /* ==========================
      MANUAL SELECT / DESELECT
  ========================== */

  function toggleParcelSelection(parcelId) {
    setAllParcel(prev =>
      prev.map(p =>
        String(p._id) === String(parcelId)
          ? {
              ...p,
              status:
                p.status === "selected"
                  ? "not-selected"
                  : "selected"
            }
          : p
      )
    );
  }

  /* ==========================
      3D PARCEL MAPPING
  ========================== */

  const parcels3D = useMemo(() => {
    return selectedParcels.map((p, i) => ({
      position: [
        -5 + (i % 4) * 2.5,               // X
        0.3 + Math.floor(i / 8) * 1.2,    // Y
        -1.5 + ((i % 8) % 2) * 2          // Z
      ],
      size: [
        p.dimensions.length / 50,
        p.dimensions.height / 50,
        p.dimensions.breadth / 50
      ]
    }));
  }, [selectedParcels]);

  /* ==========================
      UI
  ========================== */

  return (
    <main className="container my-4">
      <h2>Advanced Parcel Load</h2>

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary" onClick={getAllParcel}>
          Get Parcels
        </button>
        <button className="btn btn-primary" onClick={getAllTruck}>
          Get Trucks
        </button>
      </div>

      {hasFetchedTrucks && (
        <AllTruckBox
          allTrucks={allTrucks}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
        />
      )}

      {selectedVehicle && (
        <div className="card my-3 shadow-sm">
          <div className="card-body">
            <h6>Truck Capacity</h6>

            <div className="progress mb-2" style={{ height: 12 }}>
              <div
                className={`progress-bar ${
                  usagePercent > 90 ? "bg-danger" : "bg-success"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <small>
              {usagePercent}% filled • {selectedParcels.length} parcels
            </small>
          </div>
        </div>
      )}

      {selectedVehicle && parcels3D.length > 0 && (
        <TruckVolume3D parcels={parcels3D} />
      )}

      {selectedVehicle && hasFetchedParcels && (
        <button
          className="btn btn-danger my-3"
          onClick={calculateOptimalLoad}
        >
          Calculate Optimal Parcel
        </button>
      )}

      {hasFetchedParcels && (
        <AllParcelsTable
          allParcel={allParcel}
          onToggleSelect={toggleParcelSelection}
        />
      )}

      {selectedVehicle && selectedParcels.length > 0 && (
  <button
    className="btn btn-success my-2 ms-2"
    onClick={sendVehicleToDelivery}
  >
    Send Vehicle to Delivery
  </button>
)}

    </main>
  );
};

export default AdvancedParcelLoadBody;