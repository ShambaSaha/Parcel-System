"use client";
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { OlaMaps } from '../../../../public/olamaps/olamaps-js-sdk.es'
import { useTrackVehicleContext } from '@/context/TrackVehicleContext';


const OlaMapsComponent = ({ vehicleStatus }) => {
    const myMap = useRef(null);
    const olaMaps = useRef(null);
    const mapMarker = useRef(null);
    // const { location, setLocation } = useTrackVehicleContext();

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

        mapMarker.current = _olaMaps
            .addMarker({ offset: [0, 6], anchor: 'bottom', color: 'red' })
            .setLngLat([88.3684946, 22.4954896])
            .addTo(myOlaMap);

        myMap.current = myOlaMap;
        olaMaps.current = _olaMaps;

    };

    useMemo(() => {
        if (myMap.current) {
            mapMarker.current.setLngLat([88.3684946, 22.4954896])
        }
    }, [vehicleStatus]);


    useLayoutEffect(() => {
        initializeOlaMaps();
    }, []);

    return (
        <main className="container">
            <div id="map" style={{ minHeight: "400px", height: "85vh" }}></div>
        </main>
    )
}

export default OlaMapsComponent