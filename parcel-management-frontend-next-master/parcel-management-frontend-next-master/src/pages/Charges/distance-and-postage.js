"use client";

import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Head from 'next/head'
import DistanceAndPostageBody from '@/components/Charges/Distance-and-postage'

const distanceAndPostage = () => {
    
    return (<>
        <Head><title>Distance & Postage</title></Head>

        <DistanceAndPostageBody />
        <ToastContainer theme='colored' position="top-center" />
    </>)
}


export default distanceAndPostage