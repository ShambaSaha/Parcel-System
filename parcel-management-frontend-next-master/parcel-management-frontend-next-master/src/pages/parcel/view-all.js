"use client";

import ViewAllParcelBody from "@/components/parcel/view-all-parcel/Body";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>View All Parcel</title></Head>

        <ViewAllParcelBody />
        <ToastContainer theme="colored" />
    </>);

}

