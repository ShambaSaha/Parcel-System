"use client";

import decodePolyline from '@/lib/PolylineDecoder';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { OlaMaps } from '../../../../public/olamaps/olamaps-js-sdk.es';

const TruckRouteMap = ({ routeData, allPoints, allRoutes }) => {
    const mapContainer = useRef(null);
    const myMap = useRef(null);
    const olaMaps = useRef(null);
    const mapLoaded = useRef(false);
    
    // Refs to keep track of drawn elements so we can clear them when data changes
    const markersRef = useRef([]);
    const routeLayersRef = useRef([]);

    useLayoutEffect(() => {
        // Prevent multiple initializations in React strict mode
        if (myMap.current) return; 

        const _olaMaps = new OlaMaps({
            apiKey: "yPxHRvKgjEkVrjAzVJU733chCWyn0EHVjJRet18G",
        });

        const myOlaMap = _olaMaps.init({
            style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
            container: mapContainer.current,
            center: [88.3684946, 22.4954896],
            zoom: 14,
        });

        myMap.current = myOlaMap;
        olaMaps.current = _olaMaps;

        myMap.current.on('load', () => {
            mapLoaded.current = true;
            updateMapElements(); 
        });

        // Cleanup on component unmount
        return () => {
            if (myMap.current) {
                myMap.current.remove();
                myMap.current = null;
                mapLoaded.current = false;
            }
        };
    }, []);

    // Watch for changes in points or routes and update the map dynamically
    useEffect(() => {
        if (mapLoaded.current) {
            updateMapElements();
        }
    }, [allPoints, allRoutes]);

    // Master function to orchestrate drawing
    const updateMapElements = () => {
        clearMapElements();
        drawPoints();
        drawMultipleLines();
        fitMapToBounds();
    };

    // Clear existing markers and lines before redrawing
    const clearMapElements = () => {
        // 1. Clear Markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // 2. Clear Polylines (Layers and Sources)
        routeLayersRef.current.forEach(id => {
            if (myMap.current.getLayer(id)) myMap.current.removeLayer(id);
            if (myMap.current.getSource(id)) myMap.current.removeSource(id);
        });
        routeLayersRef.current = [];
    };

    const drawPoints = () => {
    if (!allPoints || !olaMaps.current || !myMap.current) return;

    // Only draw points that have valid coordinates
    const validPoints = allPoints.filter(p => p.lat && p.long);

    validPoints.forEach((point, index) => {
        // Logic: If it's the very first point (0) or the very last point, make it red. 
        // Anything in between becomes green.
        const isStartOrEnd = index === 0 || index === validPoints.length - 1;
        const markerColor = isStartOrEnd ? 'red' : 'green';

        const marker = olaMaps.current
            .addMarker({ 
                offset: [0, 6], 
                anchor: 'bottom', 
                color: markerColor 
            })
            .setLngLat([Number(point.long), Number(point.lat)])
            .addTo(myMap.current);
        
        // Save reference for future cleanup when the map re-renders
        markersRef.current.push(marker);
    });
};

    const drawMultipleLines = () => {
        if (!allRoutes || allRoutes.length === 0 || !myMap.current) return;

        allRoutes.forEach((route, index) => {
            if (!route?.route?.polyline) return;

            const coordinates = decodePolyline(route.route.polyline);
            const sourceId = `route-source-${index}`;
            const layerId = `route-layer-${index}`;

            myMap.current.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates,
                    },
                },
            });

            myMap.current.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': "#007bff", // Standardized to a clean blue
                    'line-width': 5,
                },
            });

            // Save reference for future cleanup
            routeLayersRef.current.push(layerId);
            routeLayersRef.current.push(sourceId); // Saving source ID to remove it later too
        });
    };

    const fitMapToBounds = () => {
        const validPoints = allPoints?.filter(p => p.lat && p.long) || [];
        if (validPoints.length === 0 || !myMap.current) return;

        // Calculate the bounding box for all points
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

        validPoints.forEach(p => {
            const lat = Number(p.lat);
            const lng = Number(p.long);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        });

        // Fit the camera to these bounds with some padding
        myMap.current.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]], 
            { padding: 50, duration: 1000 } // Duration adds a smooth zooming animation
        );
    };

    return (
        // Replaced ID with ref for better React integration
        <div ref={mapContainer} style={{ minHeight: "400px", height: "100%", width: "100%", borderRadius: "8px", overflow: "hidden" }}></div>
    );
}

export default TruckRouteMap;