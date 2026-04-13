import React, { useEffect, useRef, useState, useCallback } from 'react'
import _ from 'lodash'
import { useTrackVehicleContext } from '@/context/TrackVehicleContext';

const LocationUpdateControl = () => {
    const { location } = useTrackVehicleContext();
    const sendLocationInterval = useRef(null);
    const [intervalTime, setIntervalTime] = useState(3);
    const [isSendingLocation, setIsSendingLocation] = useState(false);
    const lastSentLocation = useRef(null);

    const sendLocation = useCallback(async () => {
        // Only send if location has changed
        if (lastSentLocation.current &&
            lastSentLocation.current.lat === location.lat &&
            lastSentLocation.current.lng === location.lng) {
            return;
        }

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/set-truck-location`;

        const currentLocation = {
            id: "truck",
            lat: location.lat,
            long: location.lng
        };

        try {
            const response = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentLocation),
            });

            const data = await response.json();
            console.log('Location sent successfully:', currentLocation);
            console.log('Server response:', data);

            // Update last sent location
            lastSentLocation.current = { ...location };
        } catch (err) {
            console.error('Error sending location:', err);
        }
    }, [location]);

    // Watch for location changes and send updates if sending is active
    useEffect(() => {
        if (isSendingLocation) {
            sendLocation();
        }
    }, [location, isSendingLocation, sendLocation]);

    const startSendingLocation = useCallback(async () => {
        if (isSendingLocation) return;

        // Send initial location
        await sendLocation();

        // Set up interval for periodic updates
        sendLocationInterval.current = setInterval(() => {
            sendLocation();
        }, intervalTime * 1000);

        setIsSendingLocation(true);
    }, [intervalTime, isSendingLocation, sendLocation]);

    const stopSendingLocation = useCallback(() => {
        clearInterval(sendLocationInterval.current);
        setIsSendingLocation(false);
        lastSentLocation.current = null;
    }, []);

    // Update interval if changed while running
    useEffect(() => {
        if (isSendingLocation) {
            clearInterval(sendLocationInterval.current);
            sendLocationInterval.current = setInterval(() => {
                sendLocation();
            }, intervalTime * 1000);
        }
    }, [intervalTime, isSendingLocation, sendLocation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInterval(sendLocationInterval.current);
        };
    }, []);

    return (
        <div className='mt-2'>
            <h6 className="card-subtitle mb-2 text-muted">Location Update Control:</h6>

            {isSendingLocation ? (
                <div className="input-group mb-3">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Interval (in seconds)"
                        value={intervalTime}
                        onChange={(e) => setIntervalTime(Math.max(1, Number(e.target.value)))}
                        min="1"
                    />
                    <button
                        className="btn btn-outline-danger"
                        type="button"
                        onClick={stopSendingLocation}
                    >
                        Stop
                    </button>
                </div>
            ) : (
                <button
                    className="btn btn-primary"
                    onClick={startSendingLocation}
                >
                    Start Sending
                </button>
            )}
        </div>
    );
};

export default LocationUpdateControl;