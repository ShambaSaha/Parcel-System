import CreateRouteBody from '@/components/truck-routes/create-route/Body'
import ViewTruckRoutesBody from '@/components/truck-routes/view-routes/Body'
import Head from 'next/head'
import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const CreateRoute = () => {
    return (
        <>
            <Head><title>View Truck Routes</title></Head>
            <ViewTruckRoutesBody />

            <ToastContainer theme='colored' />
        </>
    )
}


export default CreateRoute

