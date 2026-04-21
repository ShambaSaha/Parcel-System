"use client";

import React, { useState, useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import ttServices from '@tomtom-international/web-sdk-services';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

import { aStarWithWaypoints } from '../../../lib/TruckRouteOptimizerTwo';

const DynamicRoutingBody = () => {
    // TomTom API Key
    const API_KEY = '32tqOBXZYNTNCaD0Zkvk8YBpPw3fMOHw';

    // Map & DOM Refs
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const markersRef = useRef([]);
    const routeLayersRef = useRef([]);

    // State
    const [stops, setStops] = useState([]);
    const [optimizedStops, setOptimizedStops] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // 1️⃣ Initialize Map
    useEffect(() => {
        const initializedMap = tt.map({
            key: API_KEY,
            container: mapContainer.current,
            center: [78.9629, 20.5937],
            zoom: 4
        });
        
        setMap(initializedMap);

        // Cleanup on unmount
        return () => initializedMap.remove();
    }, []);

    // 2️⃣ Handle Map Updates when Stops change
    useEffect(() => {
        if (!map) return;

        const updateMapAndRoutes = async () => {
            if (stops.length === 0) {
                setOptimizedStops([]);
                clearMapEntities();
                return;
            }

            let calculatedStops = [...stops];

            // Run A* Optimization if we have more than a start and end point
            if (calculatedStops.length > 2) {
                const hubs = calculatedStops.map(s => ({
                    id: s.name,
                    latitude: s.latitude,
                    longitude: s.longitude,
                    numberOfParcels: s.numberOfParcels || 0
                }));

                // Run your existing optimizer
                const optimizedNames = aStarWithWaypoints(
                    hubs,
                    calculatedStops[0].name,
                    calculatedStops[calculatedStops.length - 1].name,
                    2000, 
                    2
                );

                // Reorder stops based on optimizer output
                if (optimizedNames && optimizedNames.length > 0) {
                    calculatedStops = optimizedNames
                        .map(name => calculatedStops.find(s => s.name === name))
                        .filter(Boolean); // removes undefined if any mismatches occur
                }
            }

            setOptimizedStops(calculatedStops);
            clearMapEntities();

            // Draw Markers
            calculatedStops.forEach((stop) => {
                const marker = new tt.Marker()
                    .setLngLat(stop.lngLat)
                    .addTo(map);
                markersRef.current.push(marker);
            });

            // Draw Routes between sequential optimized points
            for (let i = 0; i < calculatedStops.length - 1; i++) {
                const start = calculatedStops[i].lngLat;
                const end = calculatedStops[i+1].lngLat;
                try {
                    const routeRes = await ttServices.services.calculateRoute({
                        key: API_KEY,
                        locations: `${start[0]},${start[1]}:${end[0]},${end[1]}`
                    });
                    
                    const layerId = `route-seg-${i}`;
                    map.addLayer({
                        'id': layerId,
                        'type': 'line',
                        'source': { 'type': 'geojson', 'data': routeRes.toGeoJson() },
                        'paint': { 'line-color': '#27ae60', 'line-width': 5 }
                    });
                    routeLayersRef.current.push(layerId);
                } catch (e) { 
                    console.error("Route calculation failed:", e); 
                }
            }
        };

        updateMapAndRoutes();
    }, [stops, map]);

    const clearMapEntities = () => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        routeLayersRef.current.forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
            if (map.getSource(id)) map.removeSource(id);
        });
        routeLayersRef.current = [];
    };

    // 3️⃣ UI Actions
    const loadMockData = () => {
        // Converted your parcelHubs array to replace the external JSON
        const defaultData = [
            { name: "Hub 1", numberOfParcels: 100, lngLat: [77.5946, 12.9716], latitude: 12.9716, longitude: 77.5946 },
            { name: "Hub 2", numberOfParcels: 50, lngLat: [80.2707, 13.0827], latitude: 13.0827, longitude: 80.2707 },
            { name: "Hub 3", numberOfParcels: 30, lngLat: [76.6394, 12.2958], latitude: 12.2958, longitude: 76.6394 },
            { name: "Hub 4", numberOfParcels: 70, lngLat: [76.9558, 11.0168], latitude: 11.0168, longitude: 76.9558 },
            { name: "Hub 5", numberOfParcels: 90, lngLat: [74.856, 12.9141], latitude: 12.9141, longitude: 74.856 },
        ];
        setStops(defaultData);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const res = await ttServices.services.fuzzySearch({ 
                key: API_KEY, 
                query: searchQuery, 
                countrySet: 'IN', 
                limit: 1 
            });

            if (res.results && res.results.length > 0) {
                const result = res.results[0];
                const newStop = {
                    name: result.address.freeformAddress,
                    lngLat: [result.position.lng, result.position.lat],
                    latitude: result.position.lat,
                    longitude: result.position.lng,
                    numberOfParcels: Math.floor(Math.random() * 20)
                };
                setStops([...stops, newStop]);
                setSearchQuery('');
            } else {
                alert("Location not found.");
            }
        } catch(e) {
            console.error("Search error", e);
        }
    };

    const removeLocation = (indexToRemove) => {
        const stopToRemove = optimizedStops[indexToRemove];
        setStops(stops.filter(s => s.name !== stopToRemove.name));
    };

    const editLocation = async (indexToEdit) => {
        const stopToEdit = optimizedStops[indexToEdit];
        const newName = window.prompt("Enter new location name:", stopToEdit.name);
        
        if (!newName || newName === stopToEdit.name) return;

        try {
            const res = await ttServices.services.fuzzySearch({ 
                key: API_KEY, 
                query: newName, 
                countrySet: 'IN', 
                limit: 1 
            });

            if (res.results && res.results.length > 0) {
                const result = res.results[0];
                const updatedStops = stops.map(s => {
                    if (s.name === stopToEdit.name) {
                        return {
                            ...s,
                            name: result.address.freeformAddress,
                            lngLat: [result.position.lng, result.position.lat],
                            latitude: result.position.lat,
                            longitude: result.position.lng
                        };
                    }
                    return s;
                });
                setStops(updatedStops);
            } else {
                alert("Location not found.");
            }
        } catch (e) { 
            alert("Error updating location."); 
        }
    };

    return (
        <div className="dynamic-routing-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
                .controls { padding: 15px; background: #2c3e50; color: white; display: flex; gap: 10px; align-items: center; z-index: 100; }
                .main-container { display: flex; flex: 1; overflow: hidden; }
                .tomtom-map-container { flex: 1; height: 100%; outline: none; }
                .sidebar { width: 320px; background: #ecf0f1; padding: 15px; overflow-y: auto; border-left: 1px solid #bdc3c7; }
                .search-input { padding: 10px; border-radius: 4px; border: 1px solid #ccc; flex: 1; color: black; }
                .action-btn { padding: 10px 15px; cursor: pointer; background: #27ae60; color: white; border: none; border-radius: 4px; font-weight: bold; }
                .btn-load { background: #f39c12; }
                .location-item { background: white; padding: 10px; margin-bottom: 8px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .location-name { font-weight: bold; color: #2c3e50; display: block; margin-bottom: 5px; }
                .parcel-count { color: #e67e22; font-size: 0.8em; font-weight: bold; display: block; margin-bottom: 10px; }
                .item-actions { display: flex; gap: 5px; }
                .btn-remove { background: #e74c3c; font-size: 12px; padding: 5px 10px; color: white; border: none; border-radius: 3px; cursor: pointer; }
                .btn-edit { background: #3498db; font-size: 12px; padding: 5px 10px; color: white; border: none; border-radius: 3px; cursor: pointer; }
            `}</style>

            <div className="controls">
                <strong>Add Destination:</strong>
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Enter Place Name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="action-btn" onClick={handleSearch}>Add to Path</button>
                <button className="action-btn btn-load" onClick={loadMockData}>Load Optimizer Data</button>
            </div>

            <div className="main-container">
                {/* Map Container */}
                <div ref={mapContainer} className="tomtom-map-container" />
                
                {/* Sidebar Sequence */}
                <div className="sidebar"> 
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Optimized Sequence</h3>
                    
                    {optimizedStops.length === 0 ? (
                        <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Add destinations or load data to see the route.</p>
                    ) : (
                        optimizedStops.map((stop, index) => (
                            <div key={`${stop.name}-${index}`} className="location-item">
                                <span className="location-name">{index + 1}. {stop.name}</span>
                                <span className="parcel-count">Demand: {stop.numberOfParcels || 0} units</span>
                                <div className="item-actions">
                                    <button className="btn-edit" onClick={() => editLocation(index)}>Edit</button>
                                    {index > 0 && (
                                        <button className="btn-remove" onClick={() => removeLocation(index)}>Remove</button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DynamicRoutingBody;