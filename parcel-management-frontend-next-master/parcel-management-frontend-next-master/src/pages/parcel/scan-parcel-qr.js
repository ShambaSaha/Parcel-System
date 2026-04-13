"use client";

import Head from "next/head";
import ScanParcelQrBody from "../../components/parcel/ScanQr/Body";


export default function TrackVehicle() {
    return (<>
        <Head><title>Scan Parcel QR</title></Head>

        <ScanParcelQrBody />
    </>);

}

