import React from 'react'
import PostWiseParcelBody from "../../components/parcel/postwise-parcel/Body"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from 'next/head';

const postwiseParcel = () => {
    return (
        <>
            <Head>
                <title>Post Wise Parcel</title>
            </Head>
            <PostWiseParcelBody />
            <ToastContainer theme="colored" position="top-right" />

        </>
    )
}

export default postwiseParcel

