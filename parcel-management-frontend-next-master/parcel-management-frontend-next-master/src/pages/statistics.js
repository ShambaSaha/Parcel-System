"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import {useGlobalContext} from "../context/GlobalContext"
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

import TrackVehicle from "../pages/parcel/add-parcel";
import ViewAllParcelBody from "../pages/parcel/view-all"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalParcels: 0,
    pending: 0,
    delivered: 27,
    cancelled: 3,
    inTransit: 0,
    totalVehicles: 0,
    onHold: 1,
    failed: 0,
  });

    const { isLoggedIn } = useGlobalContext();
  const router = useRouter();

  // 1️⃣ Auth redirect hook
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  // 2️⃣ Fetch parcels
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
        setStats((prev) => ({
          ...prev,
          totalParcels: result.data.length,
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchParcels();
  }, [isLoggedIn]);

  // 3️⃣ Fetch vehicles
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
        setStats((prev) => ({
          ...prev,
          totalVehicles: result.data.length,
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchVehicles();
  }, [isLoggedIn]);

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (!isLoggedIn) return null;




  return (
    <div className="dashboard">
      {/* Header */}
      <Head><title>DashBoard</title></Head>
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
              <th>Type</th>
              <th>Status</th>
              <th>Location</th>
              <th>Driver</th>
            </tr>
          </thead>
          <tbody>
            <TableRow
              id="TRK-102"
              type="Mini Truck"
              status="Active"
              location="Delhi"
              driver="John"
            />
            <TableRow
              id="TRK-221"
              type="Cargo Van"
              status="Idle"
              location="Mumbai"
              driver="Jane"
            />
            <TableRow
              id="TRK-330"
              type="Pickup"
              status="Maintenance"
              location="Kolkata"
              driver="Mike"
            />
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

const TableRow = ({ id, type, status, location, driver }) => (
  <tr>
    <td>{id}</td>
    <td>{type}</td>
    <td>
      <span className="status">{status}</span>
    </td>
    <td>{location}</td>
    <td>{driver}</td>
  </tr>
);

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
