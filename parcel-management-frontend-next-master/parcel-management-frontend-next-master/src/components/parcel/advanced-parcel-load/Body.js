"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import 'bootstrap/dist/css/bootstrap.min.css';

import AllParcelsTable from "./AllParcelsTable";
import AllTruckBox from "./AllTruckBox";
import { Parcel, TruckLoadOptimizer } from "@/lib/TruckPackageOptimizer";

const TruckVolume3D = dynamic(
    () => import("../../../lib/TruckVolume3D"),
    { ssr: false }
);

const AdvancedParcelLoadBody = () => {
    const [allParcel, setAllParcel] = useState([]);
    const [allTrucks, setAllTrucks] = useState([]);
    const [hasFetchedParcels, setHasFetchedParcels] = useState(false);
    const [hasFetchedTrucks, setHasFetchedTrucks] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const deliveryTimerRef = useRef(null);

    // Clean up the timer if the user leaves the page before 1 minute is up
    useEffect(() => {
        return () => {
            if (deliveryTimerRef.current) clearTimeout(deliveryTimerRef.current);
        };
    }, []);

    // 👇 Control 3D visibility
    const [show3D, setShow3D] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    const selectedParcels = useMemo(
        () => allParcel.filter(p => p.status === "selected"),
        [allParcel]
    );

    // ✅ FIXED: Safely calculate Max Volume handling both Objects and flat Numbers
    const maxVolume = useMemo(() => {
        if (!selectedVehicle) return 0;
        
        if (selectedVehicle.volume && typeof selectedVehicle.volume === "object") {
            const l = selectedVehicle.volume.length || 0;
            const b = selectedVehicle.volume.breadth || 0;
            const h = selectedVehicle.volume.height || 0;
            const calculatedVol = l * b * h;
            return calculatedVol > 0 ? calculatedVol : (selectedVehicle.volume.total || 0);
        }
        
        // If volume is just a flat number from the Mongoose Schema
        return Number(selectedVehicle.volume) || 0;
    }, [selectedVehicle]);

    // ✅ FIXED: Safely calculate Used Volume from parcels
    const usedVolume = useMemo(() => {
        return selectedParcels.reduce((sum, p) => {
            // Check if dimensions object exists, otherwise fallback to root object
            const dims = p.dimensions || p; 
            const l = Number(dims.length) || 0;
            const b = Number(dims.breadth) || 0;
            const h = Number(dims.height) || 0;
            
            const vol = l * b * h;
            // Fallback to a flat volume/weight if dimensions are missing
            return sum + (vol > 0 ? vol : (Number(p.volume) || Number(p.weight) || 0));
        }, 0);
    }, [selectedParcels]);

    // ✅ FIXED: Calculate percentage safely and cap at 100%
    const usagePercent = useMemo(() => {
        if (!maxVolume || maxVolume === 0) return 0;
        const percent = Math.round((usedVolume / maxVolume) * 100);
        return Math.min(percent, 100); // Cap at 100 so UI doesn't break
    }, [maxVolume, usedVolume]);

    async function getAllParcel() {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/all-parcel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            if (res.status === "success") {
                setAllParcel(res.data.map(p => ({ ...p, status: "not-selected" })));
                setHasFetchedParcels(true);
                setShow3D(false); // Reset 3D if new parcels are fetched
                setModalConfig({ isOpen: true, title: "Data Synced", message: "Parcel manifest retrieved.", type: "success" });
            }
        } catch {
            setModalConfig({ isOpen: true, title: "Sync Failed", message: "Network error.", type: "error" });
        }
    }

    async function getAllTruck() {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/all-vehicle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            if (res.status === "success") {
                setAllTrucks(res.data);
                setHasFetchedTrucks(true);
                setModalConfig({ isOpen: true, title: "Fleet Synced", message: "Vehicle fleet data retrieved.", type: "success" });
            }
        } catch {
            setModalConfig({ isOpen: true, title: "Sync Failed", message: "Network error.", type: "error" });
        }
    }

    async function sendVehicleToDelivery() {
        if (!selectedVehicle || selectedParcels.length === 0) return;
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/send-to-delivery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicleId: selectedVehicle._id })
            }).then(r => r.json());

            if (res.status === "success") {
                // Inform the user that the timer has started
                setModalConfig({ 
                    isOpen: true, 
                    title: "Vehicle Deployed", 
                    message: "Deployment successful. The vehicle will reach its destination in 1 minute.", 
                    type: "success" 
                });
                
                // Save the vehicle name before setting it to null so the timer knows who arrived
                const dispatchedVehicleName = selectedVehicle.name || selectedVehicle.vehicleNumber || 'Vehicle';

                setSelectedVehicle(null);
                setShow3D(false);
                setAllParcel(prev => prev.map(p => ({ ...p, status: "not-selected" })));

                // 👇 Start the 1-minute countdown (60000 ms)
                if (deliveryTimerRef.current) clearTimeout(deliveryTimerRef.current);
                deliveryTimerRef.current = setTimeout(() => {
                    handleDeliveryComplete(dispatchedVehicleName);
                }, 60000); 
            }
        } catch {
            setModalConfig({ isOpen: true, title: "Error", message: "Failed to deploy.", type: "error" });
        }
    }

    // 👇 NEW: This function runs exactly 1 minute after deployment
    function handleDeliveryComplete(vehicleName) {
        // Optional: If you have an endpoint to mark it delivered in the database, call it here!
        // fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/mark-delivered`, { ... })

        // Show the success popup
        setModalConfig({ 
            isOpen: true, 
            title: "Delivery Completed! 🎉", 
            message: `${vehicleName} has successfully completed its route and delivered all parcels.`, 
            type: "success" 
        });
    }

    function calculateOptimalLoad() {
        if (!selectedVehicle) return;

        // ✅ FIXED: Provide safe fallbacks for optimizer if volume isn't an object
        const vLength = selectedVehicle.volume?.length || 200; 
        const vBreadth = selectedVehicle.volume?.breadth || 100;
        const vHeight = selectedVehicle.volume?.height || 100;

        const truck = new TruckLoadOptimizer(vLength, vBreadth, vHeight);

        const parcels = allParcel.map(p => {
            const dims = p.dimensions || p;
            return new Parcel(
                p._id, 
                dims.length || 10, 
                dims.breadth || 10, 
                dims.height || 10
            );
        });
        
        const result = truck.optimizeLoading(parcels);
        
        markParcels(result.loadedParcels);
        
        // 👇 Trigger the 3D Animation here
        setShow3D(true);
    }

    function markParcels(loadedParcels) {
        const loadedIds = loadedParcels.map(p => String(p.id));
        setAllParcel(prev => prev.map(item => ({
            ...item,
            status: loadedIds.includes(String(item._id)) ? "selected" : "not-selected"
        })));
    }

   function toggleParcelSelection(parcelId) {
        // 1. Ensure a vehicle is selected first
        if (!selectedVehicle) {
            setModalConfig({ 
                isOpen: true, 
                title: "Action Denied", 
                message: "Please select a vehicle before loading parcels.", 
                type: "error" 
            });
            return;
        }

        // 2. Find the exact parcel the user is trying to click
        const parcelToToggle = allParcel.find(p => String(p._id) === String(parcelId));
        if (!parcelToToggle) return;

        // 3. If they are trying to ADD the parcel, check the capacity
        if (parcelToToggle.status !== "selected") {
            // Calculate this specific parcel's volume safely
            const dims = parcelToToggle.dimensions || parcelToToggle;
            const l = Number(dims.length) || 0;
            const b = Number(dims.breadth) || 0;
            const h = Number(dims.height) || 0;
            
            const parcelVol = (l * b * h) > 0 
                ? (l * b * h) 
                : (Number(parcelToToggle.volume) || Number(parcelToToggle.weight) || 0);

            // Check against remaining capacity
            if (usedVolume + parcelVol > maxVolume) {
                setModalConfig({ 
                    isOpen: true, 
                    title: "Capacity Exceeded", 
                    message: "Cannot add this parcel. It exceeds the remaining maximum volume of the truck.", 
                    type: "error" 
                });
                return; // Stop execution, do not select the parcel
            }
        }

        // 4. If capacity is fine (or if they are deselecting), update the state
        setAllParcel(prev => prev.map(p =>
            String(p._id) === String(parcelId) 
                ? { ...p, status: p.status === "selected" ? "not-selected" : "selected" } 
                : p
        ));
    }

    const parcels3D = useMemo(() => {
        // 🛠️ TWEAK THIS: Increase this number to shrink the boxes.
        // If DB is in mm, try 1000. If cm, try 100. 
        // Based on your screenshot, starting at 300 might be a good baseline.
        const SCALE_FACTOR = 300; 
        
        // 🛠️ TWEAK THIS: Adjust the spacing multiplier so boxes don't float too far apart
        const SPACING = 0.8; 

        return selectedParcels.map((p, i) => {
            const dims = p.dimensions || p;
            const l = Number(dims.length) || 10;
            const b = Number(dims.breadth) || 10;
            const h = Number(dims.height) || 10;
            
            return {
                // Adjusted positioning to keep them tighter together in the truck bed
                position: [
                    -2 + (i % 4) * SPACING, 
                    0.3 + Math.floor(i / 8) * SPACING, 
                    -0.5 + ((i % 8) % 2) * SPACING
                ],
                // Apply the new scale factor to the raw dimensions
                size: [
                    l / SCALE_FACTOR, 
                    h / SCALE_FACTOR, 
                    b / SCALE_FACTOR
                ]
            };
        });
    }, [selectedParcels]);

    return (
        <>
            <style>{`
                .textured-bg { background-color: #e2e8f0; background-image: radial-gradient(at 40% 20%, hsla(228,100%,74%,0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%); }
                .glass-card { background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.5); }
                .glass-panel { background-color: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 16px; transition: all 0.3s ease; }
                .glass-panel:hover { transform: translateY(-4px); background-color: rgba(255, 255, 255, 0.85); box-shadow: 0 12px 20px -10px rgba(0, 0, 0, 0.1); }
                .dashboard-scroll { overflow-y: auto; }
                .dashboard-scroll::-webkit-scrollbar { width: 6px; }
                .dashboard-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .btn-immersive { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .btn-immersive:hover:not(:disabled) { transform: scale(1.05) translateY(-2px); box-shadow: 0 10px 20px -8px rgba(0, 0, 0, 0.3); }
                .progress-tech { height: 12px; background: rgba(0,0,0,0.05); border-radius: 20px; overflow: hidden; }
                .progress-bar-tech { transition: width 1s ease; background: linear-gradient(90deg, #10b981, #34d399); }
                .btn-ai-optimize { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; }
                
                /* Entry Animation for the 3D Container */
                .entry-3d {
                    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(30px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .custom-modal-content { background: white; border-radius: 20px; padding: 2rem; max-width: 400px; text-align: center; animation: slideUpFade 0.3s ease-out; }

                /* 👇 NEW: High-Tech 3D Simulation Chamber Styles */
                .simulation-chamber {
                    position: relative;
                    background: #ffffff;
                    border: 2px solid #e2e8f0;
                    border-radius: 1rem;
                    box-shadow: inset 0 0 30px rgba(99, 102, 241, 0.08), 0 4px 15px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
                
                .sim-grid {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(#f1f5f9 2px, transparent 2px),
                        linear-gradient(90deg, #f1f5f9 2px, transparent 2px);
                    background-size: 40px 40px;
                    pointer-events: none;
                    z-index: 0;
                }
                
                .sim-scanner {
                    position: absolute;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent);
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
                    animation: scan 3s ease-in-out infinite alternate;
                    pointer-events: none;
                    z-index: 10;
                }
                
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: calc(100% - 4px); opacity: 0; }
                }
            `}</style>

            {modalConfig.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="custom-modal-content shadow-lg">
                        <h4 className="fw-bold mb-2">{modalConfig.title}</h4>
                        <p className="text-muted mb-4">{modalConfig.message}</p>
                        <button onClick={closeModal} className="btn btn-dark w-100 rounded-pill py-2 fw-bold">Acknowledge</button>
                    </div>
                </div>
            )}

            <main className="vw-100 vh-100 d-flex align-items-center justify-content-center p-3 textured-bg overflow-hidden">
                <div className="card glass-card w-100 h-100 d-flex flex-column shadow-lg" style={{ maxWidth: '1600px', borderRadius: '24px', border: 'none' }}>
                    
                    <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white bg-opacity-20">
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#6366f1', color: 'white' }}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm11 12H3V3h10v10z"/></svg>
                            </div>
                            <div>
                                <h5 className="fw-bold mb-0">Spatial Load Optimizer</h5>
                                <small className="text-muted fw-medium">Telematics Research Tool</small>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-dark rounded-pill px-3 py-2 btn-immersive fw-bold" onClick={getAllParcel}>Sync Parcels</button>
                            <button className="btn btn-sm btn-dark rounded-pill px-3 py-2 btn-immersive fw-bold" onClick={getAllTruck}>Sync Fleet</button>
                        </div>
                    </div>

                    <div className="card-body p-4 dashboard-scroll d-flex flex-column gap-4">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="glass-panel p-3 h-100">
                                    <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">1. Vehicle Selection</h6>
                                    {hasFetchedTrucks ? (
                                        <AllTruckBox allTrucks={allTrucks} selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle} />
                                    ) : <p className="text-muted small italic">Synchronize fleet to select a vehicle.</p>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="glass-panel p-3 h-100 d-flex flex-column justify-content-center">
                                    {selectedVehicle ? (
                                        <>
                                            <h6 className="fw-bold mb-1">{selectedVehicle.name || selectedVehicle.vehicleNumber || 'Selected Vehicle'}</h6>
                                            <div className="d-flex justify-content-between mb-1 mt-3 small fw-bold text-secondary">
                                                <span>Capacity Utilization</span>
                                                <span>{usagePercent}%</span>
                                            </div>
                                            <div className="progress-tech mb-2">
                                                <div className="progress-bar-tech h-100" style={{ width: `${usagePercent}%` }} />
                                            </div>
                                            <small className="text-muted">{selectedParcels.length} parcels currently staged.</small>
                                        </>
                                    ) : <p className="text-center text-muted m-0 small">No vehicle selected.</p>}
                                </div>
                            </div>
                        </div>

                        {selectedVehicle && hasFetchedParcels && (
                            <div className="d-flex justify-content-center">
                                <button className="btn btn-ai-optimize btn-lg rounded-pill px-5 fw-bold btn-immersive shadow" onClick={calculateOptimalLoad}>
                                    Execute AI Load Optimization
                                </button>
                            </div>
                        )}

                        {show3D && selectedVehicle && parcels3D.length > 0 && (
                            <div >
                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">3D Spatial Result</h6>
                                
                                {/* 👇 NEW: Styled 3D Container */}
                                <div className="simulation-chamber" style={{ height: '380px' }}>
                                    <div className="sim-grid"></div>
                                    <div className="sim-scanner"></div>
                                    
                                    {/* Floating UI Badge */}
                                    <div className="position-absolute top-0 start-0 m-3 z-3">
                                        <div className="badge bg-white text-primary border border-primary shadow-sm rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                            <span className="text-success me-2">●</span> LIVE 3D RENDER
                                        </div>
                                    </div>

                                    {/* 3D Model wrapper */}
                                    <div className="position-relative w-100 h-100 z-1">
                                        <TruckVolume3D parcels={parcels3D} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasFetchedParcels && (
                            <div className="glass-panel p-3 flex-grow-1">
                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">2. Manifest Ledger</h6>
                                <AllParcelsTable allParcel={allParcel} onToggleSelect={toggleParcelSelection} />
                            </div>
                        )}
                    </div>

                    {selectedVehicle && selectedParcels.length > 0 && (
                        <div className="p-4 border-top bg-white bg-opacity-40 d-flex justify-content-end mt-auto">
                            <button className="btn btn-success btn-lg rounded-pill px-5 fw-bold btn-immersive shadow" onClick={sendVehicleToDelivery}>
                                Deploy to Routing →
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};

export default AdvancedParcelLoadBody;