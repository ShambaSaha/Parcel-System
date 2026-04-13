"use client";

import AdvancedParcelLoadBody from "@/components/parcel/advanced-parcel-load/Body";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>Advanced Parcel Load to Truck</title></Head>

        <AdvancedParcelLoadBody />
        <ToastContainer theme="colored" position="top-right" />
    </>);

}

