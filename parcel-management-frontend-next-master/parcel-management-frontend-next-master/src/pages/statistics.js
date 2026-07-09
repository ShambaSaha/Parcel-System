"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useGlobalContext } from "../context/GlobalContext";
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

  // Fetch 'role' along with isLoggedIn from your global context
  const { isLoggedIn, role } = useGlobalContext(); 
  const router = useRouter();

  // Exactly matches your registration option values
  const currentRole = role?.toUpperCase() || "";

  // Define strict feature access based on registration tokens
  const showVehicleFeatures = ["ADMIN", "TRUCK_ADMIN", "THREE_PL"].includes(currentRole);
  const showGeneralFeatures = ["ADMIN", "POST_MANAGER", "THREE_PL"].includes(currentRole);
  
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
          setVehicles(result.data.slice(0, 5)); 
        }
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
      }
    };

    fetchVehicles();
  }, [isLoggedIn]);

  // Master definition of all actions with target access types
  const allActions = [
    { title: "Add Parcel", link: "/parcel/add-parcel", icon: FaBoxOpen, category: "general" },
    { title: "Postal Calculator", link: "/Charges/postal-calculator", icon: FaQrcode, category: "general" },
    { title: "View Parcels", link: "/parcel/view-all", icon: FaListUl, category: "general" },
    { title: "Add Vehicle", link: "/vehicle/add-new", icon: FaTruck, category: "vehicle" },
    { title: "Locate Post Offices", link: "/post-office/view-all", icon: FaMapMarkedAlt, category: "general" },
    { title: "Create Truck Route", link: "/truck-routes/create-route", icon: FaRoute, category: "general" },
    { title: "Dynamic Routes", link: "/truck-routes/dynamic-routing", icon: FaProjectDiagram, category: "general" },
    { title: "3D Loading Parcels", link: "/parcel/advanced-parcel-load", icon: FaCubes, category: "vehicle" },
  ];

  // Dynamic Filtering based on your rules
  const visibleActions = allActions.filter(action => {
    if (action.category === "general" && !showGeneralFeatures) return false;
    if (action.category === "vehicle" && !showVehicleFeatures) return false;
    return true;
  });

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (!isLoggedIn) return null;

  return (
    <div className="dashboard">
      <Head><title>Dashboard</title></Head>
      <div className="dashboard-header">
        <h2>
          
          <br />
          <span>Hi👋 {role}</span>
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

      {/* Conditionally display the entire vehicle preview table */}
      {showVehicleFeatures && (
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
                
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => {
                  const vId = vehicle.vehicleId || vehicle._id?.substring(0, 7) || "N/A";
                  const vNum = vehicle.vehicleNumber || vehicle.number || "N/A";
                  
                  let vVol = "N/A";
                  const rawVolume = vehicle.volume || vehicle.weight;

                  if (rawVolume) {
                    if (typeof rawVolume === "object") {
                      vVol = rawVolume.total !== undefined 
                        ? rawVolume.total 
                        : `${rawVolume.length || 0}x${rawVolume.breadth || 0}x${rawVolume.height || 0}`;
                    } else {
                      vVol = rawVolume;
                    }
                  }

                  const vFuel = vehicle.fuelCapacity ? `${vehicle.fuelCapacity} L` : "N/A";
                  const hasRoute = vehicle.currentRoute || vehicle.routeId;
                  const status = vehicle.status || (hasRoute ? "IN TRANSIT" : "IDLE");

                  return (
                    <TableRow
                      key={vehicle._id || index}
                      id={vId}
                      rawId={vehicle._id} // Passing raw DB id for accurate routing
                      number={vNum} 
                      volume={vVol}
                      fuel={vFuel}
                      status={status.toUpperCase()}
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
      )}

      {/* Quick Actions Grid displaying filtered cards */}
      <div className="actions-grid">
        {visibleActions.map((action, i) => (
          <ActionCard
            key={i}
            title={action.title}
            link={action.link}
            icon={action.icon}
          />
        ))}
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

// Updated TableRow to include the Track button
const TableRow = ({ id, rawId, number, volume, fuel, status }) => {
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