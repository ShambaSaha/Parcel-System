import CreateRouteBody from '@/components/truck-routes/create-route/Body'
import Head from 'next/head'
import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CreateRoute = () => {
    return (
        <>
            <Head><title>Create Truck Routes</title></Head>
            <CreateRouteBody />
            <ToastContainer theme='colored' />
        </>
    )
}


export default CreateRoute