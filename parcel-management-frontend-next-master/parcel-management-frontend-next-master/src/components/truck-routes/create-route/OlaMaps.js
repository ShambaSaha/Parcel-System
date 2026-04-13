"use client";

import decodePolyline from '@/lib/PolylineDecoder';
import { useLayoutEffect, useRef } from 'react';
import { OlaMaps } from '../../../../public/olamaps/olamaps-js-sdk.es';


const TruckRouteMap = ({ routeData, allPoints, allRoutes }) => {
    const myMap = useRef(null);
    const olaMaps = useRef(null);
    const mapMarker = useRef(null);
    const routeMarker = useRef(null);
    const mapLoaded = useRef(false);

    async function initializeOlaMaps() {
        const _olaMaps = new OlaMaps({
            apiKey: "yPxHRvKgjEkVrjAzVJU733chCWyn0EHVjJRet18G",
        });

        const myOlaMap = _olaMaps.init({
            style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
            container: 'map',
            // center: [77.61648476788898, 12.931423492103944],
            center: [88.3684946, 22.4954896],
            zoom: 14,
        });

        // mapMarker.current = _olaMaps
        //     .addMarker({ offset: [0, 6], anchor: 'bottom', color: 'red' })
        //     .setLngLat([88.3684946, 22.4954896])
        //     .addTo(myOlaMap);

        myMap.current = myOlaMap;
        olaMaps.current = _olaMaps;

        myMap.current.on('load', async () => {
            if (!mapLoaded.current) {
                mapLoaded.current = true;
                await drawPoints();
                // drawLine();
                // console.log('allRotes', allRoutes)
                await drawMultipleLines()
            }
        });
    };


    async function drawLine() {
        if (routeMarker.current) return;

        console.log("route data", routeData)
        const coordinates = decodePolyline(routeData.polyline);
        console.log("road coordinates", coordinates);

        myMap.current.addSource('balerroute', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: [...coordinates]
                },
            },
        })


        myMap.current.addLayer({
            id: 'balerroute',
            type: 'line',
            source: 'balerroute',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': 'blue',
                'line-width': 5
            }
        });

        console.log("layer added");
        myMap.current.fitBounds(coordinates);
        routeMarker.current = true;

    }

    async function drawMultipleLines() {
        if (!allRoutes || allRoutes.length === 0) {
            console.log("No routes to draw.");
            return;
        }

        allRoutes.forEach((route, index) => {
            const coordinates = decodePolyline(route.route.polyline);

            const sourceId = `route-${index}`;
            const layerId = `route-${index}`;


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
                    'line-color': "blue", // Use a function to get random colors
                    'line-width': 5,
                },
            });
        });
    }


    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    async function drawPoints() {
        console.log("all points", allPoints);

        for (let i = 0; i < allPoints.length; i++) {
            const point = allPoints[i];
            console.log(point)
            olaMaps.current
                .addMarker({ offset: [0, 6], anchor: 'bottom', color: (point.type === "post-office") ? 'red' : 'green' })
                .setLngLat([Number(point.long), Number(point.lat)])
                .addTo(myMap.current);
        }



    }

    useLayoutEffect(() => {
        initializeOlaMaps();
    }, []);

    return (
        <div id="map" style={{ "minHeight": "400px", "height": "100%" }}></div>
    )
}

export default TruckRouteMap