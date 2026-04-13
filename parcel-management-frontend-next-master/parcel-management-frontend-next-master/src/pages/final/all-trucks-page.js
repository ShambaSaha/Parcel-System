import AllTrucksDashboardBody from "@/components/Final/Trucks/All-Trucks-Dasboard/Body";
import { TruckDashboardProvider } from '@/context/Final/TruckDashboardContext';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllTrucksDashboardPage = () => {
    return (
        <>
            <Head><title>All Trucks Dashboard Page</title></Head>

            <TruckDashboardProvider>
                <AllTrucksDashboardBody />
            </TruckDashboardProvider>
            <ToastContainer theme="colored" />
        </>
    )
}


export default AllTrucksDashboardPage