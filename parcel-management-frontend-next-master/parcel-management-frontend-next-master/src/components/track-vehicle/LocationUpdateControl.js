"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTrackVehicleContext } from '@/context/TrackVehicleContext';
import { toast } from 'react-toastify';

const LocationUpdateControl = ({ vehicleId }) => {
    const { locationRef, selectedRoute } = useTrackVehicleContext();
    const [isSending, setIsSending] = useState(false);
    const intervalRef = useRef(null);

    // Function to send data to your backend
    const sendLocationToDatabase = async () => {
        if (!selectedRoute) return;

        const payload = {
            vehicleId: vehicleId,
            routeId: selectedRoute._id,
            currentLat: locationRef.current.lat,
            currentLng: locationRef.current.lng,
            timestamp: new Date().toISOString()
        };

        try {
            const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/set-truck-location`;
            const response = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error("Failed to sync location to backend");
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
        }
    };

    // Toggle the syncing process
    const toggleSending = () => {
        if (isSending) {
            // Stop sending
            clearInterval(intervalRef.current);
            setIsSending(false);
            toast.info("Stopped broadcasting location.");
        } else {
            // Start sending every 3 seconds
            sendLocationToDatabase(); // Send immediately once
            intervalRef.current = setInterval(sendLocationToDatabase, 3000);
            setIsSending(true);
            toast.success("Live tracking broadcast started!");
        }
    };

    // Cleanup interval if component unmounts
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h5 style={{ color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '15px' }}>
                4. Broadcast Location
            </h5>
            <button 
                suppressHydrationWarning
                onClick={toggleSending}
                disabled={!selectedRoute}
                style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: selectedRoute ? 'pointer' : 'not-allowed',
                    backgroundColor: isSending ? '#dc3545' : '#28a745',
                    color: 'white',
                    transition: 'background-color 0.3s'
                }}
            >
                {isSending ? "⏹ Stop Sending" : "▶ Start Broadcasting"}
            </button>
            {isSending && (
                <p style={{ marginTop: '10px', color: '#28a745', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
                    📡 Syncing to database every 3s...
                </p>
            )}
        </div>
    );
};

export default LocationUpdateControl;