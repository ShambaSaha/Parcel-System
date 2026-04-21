"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useGlobalContext } from "../context/GlobalContext"
import {
  FaBoxOpen,
  FaQrcode,
  FaListUl,
  FaTruck,
  FaMapMarkedAlt,
  FaRoute,
  FaProjectDiagram,
  FaCubes,
} from "react-icons/fa";

export default function Dashboard() {
  // All stats initialized to 0; no more hardcoded values
  const [stats, setStats] = useState({
    totalParcels: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    inTransit: 0,
    totalVehicles: 0,
    onHold: 0,
    failed: 0,
  });

  const [vehicles, setVehicles] = useState([]);

  const { isLoggedIn } = useGlobalContext();
  const router = useRouter();

  // 1️⃣ Auth redirect hook
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  // 2️⃣ Fetch parcels and calculate dynamic statistics
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchParcels = async () => {
      try {
        const res = await fetch(
          `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/all-parcel`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await res.json();
        
        if (result.data && Array.isArray(result.data)) {
          // Dynamically count the status of each parcel
          let pending = 0, delivered = 0, cancelled = 0, inTransit = 0, onHold = 0, failed = 0;
          
          result.data.forEach(parcel => {
            const pStatus = (parcel.status || "").toLowerCase();
            
            if (pStatus.includes("pending")) pending++;
            else if (pStatus.includes("deliver")) delivered++;
            else if (pStatus.includes("cancel")) cancelled++;
            else if (pStatus.includes("transit") || pStatus.includes("progress")) inTransit++;
            else if (pStatus.includes("hold")) onHold++;
            else if (pStatus.includes("fail")) failed++;
          });

          setStats((prev) => ({
            ...prev,
            totalParcels: result.data.length,
            pending,
            delivered,
            cancelled,
            inTransit,
            onHold,
            failed
          }));
        }
      } catch (err) {
        console.error("Failed to fetch parcels:", err);
      }
    };

    fetchParcels();
  }, [isLoggedIn]);

  // 3️⃣ Fetch vehicles for table and stats
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchVehicles = async () => {
      try {
        const res = await fetch(
          `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/all-vehicle`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await res.json();
        
        if (result.status === "success" && Array.isArray(result.data)) {
          setStats((prev) => ({
            ...prev,
            totalVehicles: result.data.length,
          }));
          
          // Store up to the 5 most recent vehicles for the dashboard preview
          setVehicles(result.data.slice(0, 5)); 
        }
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
      }
    };

    fetchVehicles();
  }, [isLoggedIn]);

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (!isLoggedIn) return null;

  return (
    <div className="dashboard">
      {/* Header */}
      <Head><title>Dashboard</title></Head>
      <div className="dashboard-header">
        <h2>
          👋 Welcome back to,
          <br />
          <span>Parcel Manager</span>
        </h2>
      </div>

      {/* Stats Pills */}
      <div className="stats-grid">
        <StatPill title="Total Parcels" value={stats.totalParcels} color="blue" />
        <StatPill title="Pending" value={stats.pending} color="red" />
        <StatPill title="Delivered" value={stats.delivered} color="purple" />
        <StatPill title="Cancelled" value={stats.cancelled} color="indigo" />
        <StatPill title="In Transit" value={stats.inTransit} color="green" />
        <StatPill title="Total Vehicles" value={stats.totalVehicles} color="yellow" />
        <StatPill title="On Hold" value={stats.onHold} color="emerald" />
        <StatPill title="Failed" value={stats.failed} color="orange" />
      </div>

      {/* Vehicle Table */}
      <div className="card">
        <div className="card-header">
          <h3>🚚 Vehicle List</h3>
          <Link href="/vehicle/view-all">View All →</Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Number</th>
              <th>Volume / Weight</th>
              <th>Fuel Capacity</th>
              <th>Status</th>
              <th>Route / Driver</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle, index) => {
                // Map properties dynamically to fit both the backend schema and view-all response
                const vId = vehicle.vehicleId || vehicle._id?.substring(0, 7) || "N/A";
                const vNum = vehicle.vehicleNumber || vehicle.number || "N/A";
                
                // Safely handle Volume/Weight in case the database returns an object
                let vVol = "N/A";
                const rawVolume = vehicle.volume || vehicle.weight;

                if (rawVolume) {
                  if (typeof rawVolume === "object") {
                    // Extract total if it exists, otherwise format as L x B x H
                    vVol = rawVolume.total !== undefined 
                      ? rawVolume.total 
                      : `${rawVolume.length || 0}x${rawVolume.breadth || 0}x${rawVolume.height || 0}`;
                  } else {
                    vVol = rawVolume;
                  }
                }

                const vFuel = vehicle.fuelCapacity ? `${vehicle.fuelCapacity} L` : "N/A";
                
                // Fallback logic for status
                const hasRoute = vehicle.currentRoute || vehicle.routeId;
                const status = vehicle.status || (hasRoute ? "IN TRANSIT" : "IDLE");
                  
                // Display Route ID if available, otherwise show Driver assignment status
                const routeOrDriver = hasRoute 
                  ? `Route: ${hasRoute}` 
                  : (vehicle.assignedDriver ? "Driver Assigned" : "Unassigned");

                return (
                  <TableRow
                    key={vehicle._id || index}
                    id={vId}
                    number={vNum} 
                    volume={vVol}
                    fuel={vFuel}
                    status={status.toUpperCase()}
                    routeOrDriver={routeOrDriver}
                  />
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                  Loading vehicles or no vehicles available...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="actions-grid">
        <ActionCard
          title="Add Parcel"
          link="/parcel/add-parcel"
          icon={FaBoxOpen}
        />
        <ActionCard
          title="Postal Calculator"
          link="/Charges/postal-calculator"
          icon={FaQrcode}
        />
        <ActionCard
          title="View Parcels"
          link="/parcel/view-all"
          icon={FaListUl}
        />
        <ActionCard
          title="Add Vehicle"
          link="/vehicle/add-new"
          icon={FaTruck}
        />
        <ActionCard
          title="Locate Post Offices"
          link="/post-office/view-all"
          icon={FaMapMarkedAlt}
        />
        <ActionCard
          title="Create Truck Route"
          link="/truck-routes/create-route"
          icon={FaRoute}
        />
        <ActionCard
          title="Dynamic Routes"
          link="/truck-routes/dynamic-routing"
          icon={FaProjectDiagram}
        />
        <ActionCard
          title="3D Loading Parcels"
          link="/parcel/advanced-parcel-load"
          icon={FaCubes}
        />
      </div>
    </div>
  );
}

/* ===== Components ===== */

const StatPill = ({ title, value, color }) => (
  <div className={`stat-pill ${color}`}>
    <p>{title}</p>
    <h3>{value}</h3>
  </div>
);

const TableRow = ({ id, number, volume, fuel, status, routeOrDriver }) => {
  // Simple logic to color-code status based on IDLE vs IN TRANSIT
  const statusClass = status.includes("IN TRANSIT") || status.includes("ACTIVE") ? "active" : "idle";
  
  return (
    <tr>
      <td>{id}</td>
      <td>{number}</td>
      <td>{volume}</td>
      <td>{fuel}</td>
      <td>
        <span className={`status ${statusClass}`}>{status}</span>
      </td>
      <td>{routeOrDriver}</td>
    </tr>
  );
};

const ActionCard = ({ title, link, icon: Icon }) => (
  <Link href={link} className="action-card-link">
    <div className="action-card">
      <div className="action-icon">
        <Icon size={34} />
      </div>
      <h4 className="action-title">{title}</h4>
    </div>
  </Link>
);