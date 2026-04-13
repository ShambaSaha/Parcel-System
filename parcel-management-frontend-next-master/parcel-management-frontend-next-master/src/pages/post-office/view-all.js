"use client";

import ViewAllPostOffices from "@/components/post-office/view-all/Body";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function TrackVehicle() {
    return (<>
        <Head><title>Locate Post Offices</title></Head>

        <ViewAllPostOffices />
        <ToastContainer theme="colored" />
    </>);

}


