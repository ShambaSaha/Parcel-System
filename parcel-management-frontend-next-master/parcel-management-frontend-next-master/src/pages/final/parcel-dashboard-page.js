"use client";

import Head from "next/head";
import ParcelDashboardBody from "@/components/Final/parcel/Parcel-Dashboard/Body";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


export default function TrackVehicle() {
    return (
        <>
            <Head><title>Parcel Booking Page</title></Head>

            <ParcelDashboardBody />
            <ToastContainer theme="colored" />
        </>
    );
}



