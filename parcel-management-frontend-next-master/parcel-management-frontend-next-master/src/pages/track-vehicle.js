"use client";

import TrackVehicleBody from "@/components/track-vehicle/Body";
import { TrackVehicleProvider } from "@/context/TrackVehicleContext";
import Head from "next/head";


export default function TrackVehicle() {
    return (
        <>
            <Head><title>Track A Vehicle</title></Head>

            <TrackVehicleProvider>
                <main className="container my-3">
                    <h1>Track Vehicle</h1>

                    <TrackVehicleBody />
                </main>
            </TrackVehicleProvider>
        </>
    );


}
