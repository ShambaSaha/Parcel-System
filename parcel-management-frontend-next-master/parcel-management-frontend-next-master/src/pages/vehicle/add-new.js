"use client";


import AddVehicleBody from "@/components/vehicle/add-new/Body";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>Add New Vehicle</title></Head>

        <AddVehicleBody />
        <ToastContainer theme="colored" />
    </>);

}

