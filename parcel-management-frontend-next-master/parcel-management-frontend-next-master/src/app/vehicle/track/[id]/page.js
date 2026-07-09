"use client";

import { use } from "react"; 
import Head from "next/head";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { TrackVehicleProvider } from "@/context/TrackVehicleContext"; 

// Using next/dynamic avoids the HTML hydration errors for maps and controllers!
const VirtualCarController = dynamic(
  () => import("@/components/track-vehicle/VirtualContoller"),
  { ssr: false }
);

const LiveTrackingMap = dynamic(
  () => import("@/components/track-vehicle/LiveTrackingMap"),
  { ssr: false }
);

export default function TrackVehiclePage({ params }) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;

  return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Track Vehicle | {vehicleId}</title>
      </Head>

      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Live Tracking for Vehicle: <span style={{ color: '#007bff' }}>{vehicleId}</span></h2>
        <p style={{ color: '#6c757d' }}>Select a route on the left, then drive the vehicle to watch it move on the map.</p>
      </div>

      {/* Both components MUST be inside the provider so they share the exact same location data */}
      <TrackVehicleProvider>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Left Column: The Controller */}
          <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
            <VirtualCarController vehicleId={vehicleId} />
          </div>

          {/* Right Column: The Map */}
          <div style={{ flex: '2 1 600px' }}>
            <LiveTrackingMap />
          </div>

        </div>
      </TrackVehicleProvider>

    </div>
  );
}