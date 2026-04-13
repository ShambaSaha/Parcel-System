"use client";

import ViewAllVehicleBody from "@/components/vehicle/view-all/Body";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>View All Vehicle</title></Head>

        <ViewAllVehicleBody />
        <ToastContainer theme="colored" />
    </>);

}


