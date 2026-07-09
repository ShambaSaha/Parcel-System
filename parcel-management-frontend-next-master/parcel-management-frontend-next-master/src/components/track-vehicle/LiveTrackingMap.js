"use client";

import React, { useEffect, useRef } from 'react';
import { useTrackVehicleContext } from '@/context/TrackVehicleContext';
import { OlaMaps } from '../../../public/olamaps/olamaps-js-sdk.es';

// 🛑 BULLETPROOF ERROR SILENCER (Catches Strings AND Error Objects)
if (typeof window !== 'undefined') {
    const originalConsoleError = window.console.error;
    window.console.error = (...args) => {
        try {
            // Convert everything (even Error objects) into a single text string
            const errorString = args.map(arg => 
                arg instanceof Error ? arg.message : 
                typeof arg === 'object' ? JSON.stringify(arg) : 
                String(arg)
            ).join(' ');

            // If the error mentions 429, AJAX, or 3d_model, silently destroy it.
            if (
                errorString.includes('429') || 
                errorString.includes('AJAXError') || 
                errorString.includes('3d_model')
            ) {
                return; 
            }
        } catch (e) {
            // Ignore any parsing errors
        }
        
        // Let all other normal errors pass through
        originalConsoleError(...args);
    };
}

const LiveTrackingMap = () => {
    const mapContainer = useRef(null);
    const myMap = useRef(null);
    const olaMaps = useRef(null);
    
    const truckMarkerRef = useRef(null);
    const waypointMarkersRef = useRef([]); 
    
    const { location, selectedRoute } = useTrackVehicleContext();

    // 1. Initialize the Map exactly once
    useEffect(() => {
        if (myMap.current) return; 

        const _olaMaps = new OlaMaps({
            apiKey: "yPxHRvKgjEkVrjAzVJU733chCWyn0EHVjJRet18G",
        });

        const myOlaMap = _olaMaps.init({
            style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
            container: mapContainer.current,
            center: [88.322346, 22.578214],
            zoom: 13,
        });

        myMap.current = myOlaMap;
        olaMaps.current = _olaMaps;

        return () => {
            if (myMap.current) {
                myMap.current.remove();
                myMap.current = null;
            }
        };
    }, []);

    // 2. Watch for Route Selection -> Draw the Route & Points safely
    useEffect(() => {
        if (!myMap.current || !olaMaps.current || !selectedRoute || !selectedRoute.waypoints) return;

        // Ensure we have valid waypoints
        if (selectedRoute.waypoints.length === 0) return;

        myMap.current.on('load', drawRoute);
        if (myMap.current.isStyleLoaded()) drawRoute();

        function drawRoute() {
            try {
                // A. Clear old waypoint markers
                waypointMarkersRef.current.forEach(marker => marker.remove());
                waypointMarkersRef.current = [];

                // B. Clear old drawn line
                if (myMap.current.getSource('route-source')) {
                    if (myMap.current.getLayer('route-layer')) myMap.current.removeLayer('route-layer');
                    myMap.current.removeSource('route-source');
                }

                // Extract valid coordinates
                const coordinates = selectedRoute.waypoints
                    .filter(wp => !isNaN(wp.long) && !isNaN(wp.lat))
                    .map(wp => [Number(wp.long), Number(wp.lat)]);

                if (coordinates.length === 0) return;

                // C. Draw the Waypoint Markers
                selectedRoute.waypoints.forEach((wp, index) => {
                    if (isNaN(wp.long) || isNaN(wp.lat)) return;
                    
                    const isStartOrEnd = index === 0 || index === selectedRoute.waypoints.length - 1;
                    const marker = olaMaps.current
                        .addMarker({ 
                            offset: [0, 0], 
                            color: isStartOrEnd ? 'red' : 'green' 
                        })
                        .setLngLat([Number(wp.long), Number(wp.lat)])
                        .addTo(myMap.current);
                    
                    waypointMarkersRef.current.push(marker);
                });

                // D. Draw the Polyline
                myMap.current.addSource('route-source', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        }
                    }
                });

                myMap.current.addLayer({
                    id: 'route-layer',
                    type: 'line',
                    source: 'route-source',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#007bff',
                        'line-width': 5,
                        'line-opacity': 0.7
                    }
                });

                // E. Safely calculate bounds and gently zoom out
                // E. Safely calculate bounds
                let minLng = coordinates[0][0], maxLng = coordinates[0][0];
                let minLat = coordinates[0][1], maxLat = coordinates[0][1];

                for (const coord of coordinates) {
                    if (coord[0] < minLng) minLng = coord[0];
                    if (coord[0] > maxLng) maxLng = coord[0];
                    if (coord[1] < minLat) minLat = coord[1];
                    if (coord[1] > maxLat) maxLat = coord[1];
                }

                // 🛑 CRITICAL SAFETY: Prevent 0-size bounds if route is just 1 point
                if (minLng === maxLng) { minLng -= 0.01; maxLng += 0.01; }
                if (minLat === maxLat) { minLat -= 0.01; maxLat += 0.01; }

                // 🛑 Let the map finish drawing the line for 500ms before zooming the camera
                setTimeout(() => {
                    if (myMap.current) {
                        try {
                            myMap.current.fitBounds(
                                [[minLng, minLat], [maxLng, maxLat]], 
                                { padding: 50, maxZoom: 14, duration: 1500 }
                            );
                        } catch (e) {
                            console.error("Camera zoom skipped safely");
                        }
                    }
                }, 500); 

            } catch (err) {
                console.error("Error drawing route on map:", err);
            }
        
        }
    }, [selectedRoute]);

    // 3. Watch for Truck Movement -> Move Marker (WITHOUT Hijacking Camera)
    useEffect(() => {
        if (!myMap.current || !olaMaps.current) return;
        if (!location || isNaN(location.lat) || isNaN(location.lng)) return;

        if (!truckMarkerRef.current) {
            truckMarkerRef.current = olaMaps.current
                .addMarker({ offset: [0, 0], color: 'blue' })
                .setLngLat([location.lng, location.lat])
                .addTo(myMap.current);
        } else {
            // ONLY update the marker's visual position. No camera panTo!
            truckMarkerRef.current.setLngLat([location.lng, location.lat]);
        }
    }, [location]);

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '650px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div ref={mapContainer} style={{ height: '100%', width: '100%' }}></div>
        </div>
    );
};

export default LiveTrackingMap;