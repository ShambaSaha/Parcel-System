"use client";

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const ParcelQr = ({ parcelId, parcelData = {} }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    // Combine ID and all available data into a single payload for the QR scanner
    const qrPayload = JSON.stringify({ 
        id: parcelId, 
        name: parcelData.name,
        service: parcelData.serviceType,
        category: parcelData.itemType,
        weight: parcelData.weight,
        dimensions: `${parcelData.length}x${parcelData.breadth}x${parcelData.height}`,
        origin: `${parcelData.srcCity}, ${parcelData.srcPincode}`,
        destination: `${parcelData.destCity}, ${parcelData.destCountry} - ${parcelData.destPincode}`
    });

    async function generateQR() {
        if (!parcelId) return;
        
        try {
            const imageUrl = await QRCode.toDataURL(qrPayload, {
                // Using 'M' (Medium) instead of 'high' because encoding a lot of JSON 
                // makes the QR code very dense and hard for standard phone cameras to read.
                errorCorrectionLevel: "M", 
                type: "image/png",
                width: 250,
                margin: 2
            });

            setQrCodeUrl(imageUrl);
        } catch (err) {
            console.error("QR Generation Error:", err);
        }
    }

    async function downloadQr() {
        try {
            const imageUrl = await QRCode.toDataURL(qrPayload, {
                errorCorrectionLevel: "M",
                type: "image/png",
                width: 500, // Higher resolution for downloading/printing
                margin: 2
            });

            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `Manifest-${parcelId}.png`;
            a.click();
        } catch (err) {
            console.error("QR Download Error:", err);
        }
    }

    useEffect(() => {
        generateQR();
    }, [parcelId, parcelData]);

    return (
        <div className="d-flex flex-column align-items-center w-100">
            <style>{`
                .manifest-details {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1rem;
                    width: 100%;
                    text-align: left;
                    margin-top: 1rem;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.3rem 0;
                    border-bottom: 1px dashed #cbd5e1;
                    font-size: 0.85rem;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .detail-label {
                    color: #64748b;
                    font-weight: 600;
                }
                .detail-value {
                    color: #0f172a;
                    font-weight: 700;
                    text-align: right;
                }
                .qr-image-container {
                    background: white;
                    padding: 10px;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    display: inline-block;
                }
            `}</style>

            {/* QR Code Display */}
            {qrCodeUrl ? (
                <div className="qr-image-container shadow-sm">
                    <img style={{ height: "180px", width: "180px" }} src={qrCodeUrl} alt="Secure Manifest QR" />
                </div>
            ) : (
                <div className="spinner-border text-primary my-4" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}

            {/* Data Summary / Digital Label */}
            <div className="manifest-details shadow-sm">
                <div className="detail-row pb-2 mb-2 border-bottom" style={{ borderBottomStyle: 'solid' }}>
                    <span className="detail-label text-uppercase" style={{ fontSize: '0.75rem' }}>Tracking ID</span>
                    <span className="detail-value text-primary font-monospace">{parcelId.substring(0, 10).toUpperCase()}...</span>
                </div>
                
                {parcelData.itemType && (
                    <>
                        <div className="detail-row">
                            <span className="detail-label">Content</span>
                            <span className="detail-value">{parcelData.itemType}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Weight & Dims</span>
                            <span className="detail-value">
                                {parcelData.weight}g | {parcelData.length}x{parcelData.breadth}x{parcelData.height}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Routing</span>
                            <span className="detail-value">
                                {parcelData.srcCity} → {parcelData.destCity}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Service</span>
                            <span className="detail-value">{parcelData.serviceType}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 mt-3 w-100">
                <button className='btn btn-outline-secondary btn-sm flex-grow-1 fw-bold' onClick={generateQR}>
                    Refresh
                </button>
                <button className='btn btn-dark btn-sm flex-grow-1 fw-bold' style={{ backgroundColor: '#0f172a' }} onClick={downloadQr}>
                    Download Label
                </button>
            </div>
        </div>
    );
};

export default ParcelQr;