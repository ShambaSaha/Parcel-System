"use client";

import Head from "next/head";
import AddParcelBody from "@/components/parcel/add-parcel/Body";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


export default function TrackVehicle() {
    return (
        <>
            <Head><title>Add New Parcel</title></Head>

            <AddParcelBody />
            <ToastContainer theme="colored" />
        </>
    );

}

