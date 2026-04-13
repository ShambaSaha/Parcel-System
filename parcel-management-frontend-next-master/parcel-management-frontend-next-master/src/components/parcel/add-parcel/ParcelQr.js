"use client";

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode';

const ParcelQr = ({ parcelId, parcelData }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    async function generateQR() {
        const text = JSON.stringify({ id: parcelId });
        try {
            const imageUrl = await QRCode.toDataURL(text,
                {
                    errorCorrectionLevel: "high",
                    type: "image/png",
                    height: 400,
                    width: 400,
                }
            )

            setQrCodeUrl(imageUrl);

        } catch (err) {
            console.error(err)
            // return false;
        }
    }

    async function downloadQr() {
        const text = JSON.stringify({ id: parcelId });
        try {
            const imageUrl = await QRCode.toDataURL(text,
                {
                    errorCorrectionLevel: "high",
                    type: "image/png",
                    height: 300,
                    width: 300,
                }
            )

            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `parcel-${parcelId}.png`;
            a.click();

        } catch (err) {
            console.error(err)
            // return false;
        }
    }

    useEffect(() => {
        generateQR();
    }, [parcelId])


    return (
        <div>
            <p className='mt-3'>
                <span>Parcel ID: {parcelId}</span>
                <button className='btn btn-sm btn-secondary ms-2' onClick={generateQR}>Re-Generate QR</button>
            </p>

            {
                qrCodeUrl && <img style={{ "height": "300px", "width": "300px" }} src={qrCodeUrl} alt="QR Code" />
            }

            <button className='btn btn-sm btn-primary mt-3' onClick={downloadQr}>Download QR</button>

        </div>
    )
}

export default ParcelQr