import Head from 'next/head'
import React from 'react'
import ParcelOrderBody from '../../components/Final/parcel/Parcel-Dashboard/parcel-oder-page/Body'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ParcelOrderPage = () => {
    return (
        <>
            <Head><title>Parcel Order Page</title></Head>
            <ParcelOrderBody />
            <ToastContainer theme='colored' />
        </>
    )
}

export default ParcelOrderPage