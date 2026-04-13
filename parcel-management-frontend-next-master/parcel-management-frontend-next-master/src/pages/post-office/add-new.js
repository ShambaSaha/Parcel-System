"use client";

import Head from "next/head";
import AddParcelBody from "@/components/parcel/add-parcel/Body";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import AddPostOfficeBody from "../../components/post-office/add-new/Body";


export default function TrackVehicle() {
    return (
        <>
            <Head><title>Add New Post Office</title></Head>
            <AddPostOfficeBody />
            <ToastContainer theme="colored" />
        </>
    );
}
