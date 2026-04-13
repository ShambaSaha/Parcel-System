"use client";

import Head from "next/head";
import AddContractorBody from "@/components/contractor/add-new/Body";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


export default function TrackVehicle() {
    return (
        <>
            <Head><title>Add New Contractor</title></Head>

            <AddContractorBody />
            <ToastContainer theme="colored" />
        </>
    );
}

