"use client";

import Head from "next/head";
import ParcelManagement from "../../components/parcel/parcel-load/Body";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>Add parcel to Truck</title></Head>

        <ParcelManagement />
        <ToastContainer theme="colored" position="top-right" />
    </>);
}

