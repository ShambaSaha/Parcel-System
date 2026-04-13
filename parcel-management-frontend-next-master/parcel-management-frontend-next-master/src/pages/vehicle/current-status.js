"use client";

import AddParcelBody from "@/components/parcel/add-parcel/Body";
import AddVehicleBody from "@/components/vehicle/add-new/Body";
import CurrentStatusBody from "@/components/vehicle/current-status/Body";
import ViewAllVehicleBody from "@/components/vehicle/view-all/Body";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>Current Status of a Vehicle</title></Head>
        <CurrentStatusBody />
        <ToastContainer theme="colored" position="top-center" />
    </>);
}


