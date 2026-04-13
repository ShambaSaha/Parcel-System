"use client";

import ViewAllContractorBody from "@/components/contractor/view-all/Body";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>View All Contractor</title></Head>

        <ViewAllContractorBody />
        <ToastContainer theme="colored" />
    </>);

}

