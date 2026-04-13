"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

const QRCodeReader = () => {
    const router = useRouter();
    const parcelIdRef = useRef(null);

    const [qrCode, setQrCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanner, setScanner] = useState(null);
    const [parcel, setParcel] = useState(null);
    const [hideCamera, setHideCamera] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);

    let newScanner = null;

    const handleScan = async () => {
        if (scanner || newScanner || document.getElementById("reader") === null) return;

        newScanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 15,
                showZoomSliderIfSupported: true,
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            },
            true
        );

        setScanner(newScanner);
        setHideCamera(false);
        newScanner.render(onScanSuccess, onScanFailure);
    };

    const onScanSuccess = async (decodedText) => {
        await newScanner.pause(true);
        setHideCamera(true);
        setQrCode(decodedText);

        try {
            setLoading(true);
            const decodedJson = JSON.parse(decodedText);
            const { id } = decodedJson;
            parcelIdRef.current = decodedJson;
            await getParcelDetails(id);
        } catch {
            setError("Invalid QR Code");
        } finally {
            setLoading(false);
        }
    };

    const onScanFailure = (error) => console.error("Scan failure:", error);

    const stopScanning = async () => {
        if (scanner) {
            await scanner.clear();
            setScanner(null);
            setHideCamera(true);
        }
    };

    const getParcelDetails = async (parcelId) => {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/get-details`;

        const params = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: parcelId }),
        };

        try {
            const response = await fetch(API, params).then((res) => res.json());
            if (response.status === "success") {
                setParcel(response.data);
                setHasChecked(true);
            } else {
                setError("Parcel not found");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch parcel details");
        }
    };

    const restartScanning = async () => {
        setHideCamera(false);
        setHasChecked(false);
        setParcel(null);
        setQrCode("");
        setError("");
        if (scanner) await scanner.resume();
    };

    useEffect(() => {
        const cleanup = () => scanner?.clear();
        window.addEventListener("beforeunload", cleanup);
        router.events.on("routeChangeStart", cleanup);

        return () => cleanup();
    }, [scanner]);

    return (
        <div className="container py-4">
            {/* QR Code Reader */}
            <div className="text-center">
                <div
                    id="reader"
                    style={{ height: "400px", width: "100%" }}
                    hidden={hideCamera}
                ></div>
            </div>

            {/* Buttons and Loading */}
            {!hasChecked && !error && (
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <button onClick={handleScan} className="btn btn-dark">
                        Start Camera
                    </button>
                </div>
            )}

            {loading && (
                <div className="text-center mt-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger mt-4 text-center">
                    <p className="mb-2">{error}</p>
                    <button onClick={restartScanning} className="btn btn-primary">
                        Scan Again
                    </button>
                </div>
            )}

            {/* Parcel Details */}
            {parcel && hasChecked && (
                <div className="card mt-4 shadow">
                    <div className="card-header bg-dark text-white">
                        <h4 className="mb-0">Parcel Details</h4>
                    </div>
                    <div className="card-body">
                        <p className="mb-2">
                            <strong>ID:</strong> {parcel._id}
                        </p>
                        <p className="mb-2">
                            <strong>Name:</strong> {parcel.name}
                        </p>
                        <p className="mb-2">
                            <strong>Dimensions:</strong> Length: {parcel.dimensions?.length} cm, Breadth:{" "}
                            {parcel.dimensions?.breadth} cm, Height: {parcel.dimensions?.height} cm
                        </p>
                        <p className="mb-2">
                            <strong>Source</strong>  State: {parcel.sender?.state}, City:{" "}
                            {parcel.sender?.city},  Pin Code: {parcel.sender?.pincode}
                        </p>
                        <p className="mb-2">
                            <strong>Destination</strong>  State: {parcel.receiver?.state}, City:{" "}
                            {parcel.receiver?.city}, Pin Code: {parcel.receiver?.pincode}
                        </p>
                        <p className="mb-2">
                            <strong>Weight:</strong> {parcel.weight} g
                        </p>
                        <button onClick={restartScanning} className="btn btn-dark mt-3">
                            Scan Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeReader;
