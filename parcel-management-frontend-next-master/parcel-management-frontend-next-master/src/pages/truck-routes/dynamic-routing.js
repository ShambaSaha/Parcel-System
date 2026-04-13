import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DynamicRoutingBody from '../../components/truck-routes/dynamic-routing/Body'
import Head from 'next/head'

const DynamicRouting = () => {
    return (
        <>
            <Head><title>Dynamic Routing</title></Head>

            <DynamicRoutingBody />
            <ToastContainer theme='colored' />
        </>
    )
}

export default DynamicRouting