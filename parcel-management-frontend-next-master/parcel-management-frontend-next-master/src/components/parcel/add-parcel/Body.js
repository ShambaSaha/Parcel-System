"use client";

import React, { useState, useMemo } from 'react';
import ParcelQr from './ParcelQr';

// --- SMART LOCATION DICTIONARY ---
// In a full production app, this would be fetched from an API. 
// For this component, we use a robust localized dictionary.
const locationData = {
    "India": {
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi", "Central Delhi"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
        "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Mangalore"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kozhikode"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
        "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"],
    },
    "United States": {
        "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
        "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
        "Texas": ["Houston", "San Antonio", "Dallas", "Austin"],
        "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"],
        "Illinois": ["Chicago", "Aurora", "Naperville", "Joliet"]
    },
    "United Kingdom": {
        "England": ["London", "Birmingham", "Manchester", "Liverpool"],
        "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"],
        "Wales": ["Cardiff", "Swansea", "Newport"],
        "Northern Ireland": ["Belfast", "Derry", "Lisburn"]
    },
    "Canada": {
        "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton"],
        "Quebec": ["Montreal", "Quebec City", "Laval"],
        "British Columbia": ["Vancouver", "Surrey", "Burnaby", "Richmond"],
        "Alberta": ["Calgary", "Edmonton", "Red Deer"]
    },
    "Australia": {
        "New South Wales": ["Sydney", "Newcastle", "Wollongong"],
        "Victoria": ["Melbourne", "Geelong", "Ballarat"],
        "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast"],
        "Western Australia": ["Perth", "Mandurah", "Bunbury"]
    },
    "Germany": {
        "Bavaria": ["Munich", "Nuremberg", "Augsburg"],
        "Berlin": ["Berlin City"],
        "Hesse": ["Frankfurt", "Wiesbaden", "Kassel"],
        "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund"]
    },
    "France": {
        "Île-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis"],
        "Provence-Alpes": ["Marseille", "Nice", "Toulon"],
        "Auvergne-Rhône-Alpes": ["Lyon", "Saint-Étienne", "Grenoble"]
    },
    "Japan": {
        "Tokyo": ["Shinjuku", "Shibuya", "Minato"],
        "Osaka": ["Osaka City", "Sakai", "Higashiosaka"],
        "Kyoto": ["Kyoto City", "Uji"],
        "Hokkaido": ["Sapporo", "Asahikawa"]
    },
    "Singapore": {
        "Central Region": ["Downtown Core", "Novena", "Toa Payoh"],
        "East Region": ["Bedok", "Tampines", "Pasir Ris"],
        "North Region": ["Woodlands", "Yishun"]
    },
    "UAE": {
        "Dubai": ["Dubai City", "Jebel Ali", "Deira"],
        "Abu Dhabi": ["Abu Dhabi City", "Al Ain"],
        "Sharjah": ["Sharjah City", "Khor Fakkan"]
    },
    "Saudi Arabia": {
        "Riyadh": ["Riyadh City", "Al Kharj"],
        "Makkah": ["Mecca", "Jeddah", "Ta'if"],
        "Eastern Province": ["Dammam", "Dhahran", "Al Khobar"]
    }
};


const AddParcelBody = () => {
    const [parcelId, setParcelId] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Custom Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const [parcelData, setParcelData] = useState({
        name: '',
        length: '',
        breadth: '',
        height: '',
        weight: '',
        serviceType: 'Domestic',
        itemType: '',
        srcCountry: 'India', // Sender is always India
        srcPincode: '',
        srcState: '',
        srcCity: '',
        destCountry: 'India', // Default to India for Domestic
        destPincode: '',
        destState: '',
        destCity: '',
    });

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    // Auto-Calculating Postage Logic (Varies by selected country)
    const estimatedPostage = useMemo(() => {
        const { itemType, weight, length, breadth, height, serviceType, destCountry } = parcelData;

        if (!itemType || !weight || !length || !breadth || !height) return null;
        if (serviceType === 'International' && !destCountry) return null;

        const volWeight = (parseFloat(length) * parseFloat(breadth) * parseFloat(height)) / 5000;
        const actualWeightKG = parseFloat(weight) / 1000;
        const chargeableWeight = Math.max(actualWeightKG, volWeight);
        const weightMultiplier = Math.ceil(chargeableWeight / 0.5);

        let calculatedCost = 0;

        if (itemType === 'Blind Literature Packet') {
            calculatedCost = 0; // Free
        } else if (serviceType === 'Domestic') {
            let domesticBaseRate = 0;
            switch (itemType) {
                case 'Letter/Document': domesticBaseRate = 15; break;
                case 'Book Packet': domesticBaseRate = 20; break;
                case 'Registered Newspaper': domesticBaseRate = 10; break;
                case 'Parcel': domesticBaseRate = 40; break;
                default: domesticBaseRate = 30;
            }
            calculatedCost = domesticBaseRate * weightMultiplier;
        } else if (serviceType === 'International') {
            const internationalRates = {
                'United States': 2500, 'United Kingdom': 2400, 'Canada': 3650,
                'Australia': 3800, 'Germany': 3500, 'France': 2500,
                'Japan': 2400, 'Singapore': 2100, 'UAE': 1900, 'Saudi Arabia': 2200,
            };
            const intBaseRate = internationalRates[destCountry] || 3000;
            calculatedCost = intBaseRate * weightMultiplier;
        }

        return {
            cost: calculatedCost.toFixed(2),
            chargeableWeight: chargeableWeight.toFixed(2),
            isFree: itemType === 'Blind Literature Packet'
        };
    }, [ parcelData.itemType, parcelData.weight, parcelData.length, parcelData.breadth, parcelData.height, parcelData.serviceType, parcelData.destCountry ]);

    async function handleSubmit(e) {
        e.preventDefault();

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/add-new`;

        const data = {
            name: parcelData.name.trim(),
            length: Number(parcelData.length),
            breadth: Number(parcelData.breadth),
            height: Number(parcelData.height),
            dimensions: {
                length: Number(parcelData.length),
                breadth: Number(parcelData.breadth),
                height: Number(parcelData.height),
            },
            weight: Number(parcelData.weight),
            serviceType: parcelData.serviceType,
            itemType: parcelData.itemType,
            srcPincode: parcelData.srcPincode.trim(),
            srcCity: parcelData.srcCity,
            srcState: parcelData.srcState,
            destCountry: parcelData.destCountry,
            destPincode: parcelData.destPincode.trim(),
            destCity: parcelData.destCity,
            destState: parcelData.destState,
            cost: estimatedPostage ? Number(estimatedPostage.cost) : 0
        };

        if (Object.values(parcelData).some((field) => field === '')) {
            setModalConfig({
                isOpen: true,
                title: 'Missing Information',
                message: 'Please ensure all required fields are filled out before proceeding.',
                type: 'warning'
            });
            return;
        }

        const params = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

        try {
            setLoading(true);
            const response = await fetch(API, params).then((res) => res.json());
            
            if (response.status === 'success' || response._id || response.id) {
                const generatedId = response.data?._id || response.id || response._id;
                setModalConfig({
                    isOpen: true,
                    title: 'Parcel Registered',
                    message: 'The consignment has been successfully added to the network.',
                    type: 'success'
                });
                setParcelId(generatedId);
            } else {
                setModalConfig({
                    isOpen: true,
                    title: 'Registration Failed',
                    message: response.message || 'An error occurred while attempting to register the parcel.',
                    type: 'error'
                });
            }
        } catch (error) {
            setModalConfig({
                isOpen: true,
                title: 'Network Error',
                message: 'Could not connect to the server. Please try again later.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    }

    // 🚀 SMART HANDLE CHANGE: Cascading Resets
    function handleChange(e) {
        const { name, value } = e.target;
        
        if (name === 'serviceType') {
            setParcelData({ 
                ...parcelData, 
                serviceType: value,
                destCountry: value === 'Domestic' ? 'India' : '',
                destState: '',
                destCity: ''
            });
        } else if (name === 'destCountry') {
            setParcelData({ ...parcelData, destCountry: value, destState: '', destCity: '' });
        } else if (name === 'srcState') {
            setParcelData({ ...parcelData, srcState: value, srcCity: '' });
        } else if (name === 'destState') {
            setParcelData({ ...parcelData, destState: value, destCity: '' });
        } else {
            setParcelData({ ...parcelData, [name]: value });
        }
    }

    function resetForm() {
        setParcelData({
            name: '', length: '', breadth: '', height: '', weight: '',
            serviceType: 'Domestic', itemType: '',
            srcCountry: 'India', srcPincode: '', srcState: '', srcCity: '',
            destCountry: 'India', destPincode: '', destState: '', destCity: '',
        });
    }

    // Helper variables to populate dependent dropdowns safely
    const srcStatesAvailable = Object.keys(locationData["India"] || {});
    const srcCitiesAvailable = parcelData.srcState ? locationData["India"][parcelData.srcState] : [];
    
    const destStatesAvailable = parcelData.destCountry ? Object.keys(locationData[parcelData.destCountry] || {}) : [];
    const destCitiesAvailable = parcelData.destCountry && parcelData.destState 
        ? locationData[parcelData.destCountry][parcelData.destState] 
        : [];

    return (
        <>
            <style>{`
                /* Premium Textured/Gradient Background */
                .textured-bg {
                    background-color: #e2e8f0;
                    background-image: 
                        radial-gradient(at 40% 20%, hsla(228,100%,74%,0.2) 0px, transparent 50%),
                        radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%),
                        radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%),
                        radial-gradient(at 80% 100%, hsla(240,100%,86%,0.3) 0px, transparent 50%),
                        radial-gradient(at 0% 0%, hsla(343,100%,76%,0.15) 0px, transparent 50%);
                }
                
                .glass-panel {
                    background-color: rgba(255, 255, 255, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .glass-panel:hover {
                    transform: translateY(-4px) scale(1.01);
                    background-color: rgba(255, 255, 255, 0.65);
                    box-shadow: 0 15px 35px -10px rgba(71, 85, 105, 0.15);
                    border-color: rgba(255, 255, 255, 0.9);
                    z-index: 5;
                }

                .btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .btn:hover:not(:disabled) {
                    transform: scale(1.04) translateY(-2px);
                    box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.3) !important;
                }
                .btn:active:not(:disabled) {
                    transform: scale(0.98) translateY(0);
                }

                .custom-input, .custom-select {
                    background-color: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(148, 163, 184, 0.5);
                    border-radius: 12px;
                    padding: 10px 14px;
                    color: #1e293b;
                    font-size: 0.95rem;
                    width: 100%;
                    backdrop-filter: blur(8px);
                    position: relative;
                    z-index: 1;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .custom-input:disabled, .custom-select:disabled {
                    background-color: rgba(226, 232, 240, 0.5);
                    color: #64748b;
                    cursor: not-allowed;
                    border-color: rgba(148, 163, 184, 0.2);
                }
                .custom-input::placeholder {
                    color: #94a3b8;
                    transition: color 0.3s ease;
                }
                .custom-input:hover:not(:disabled), .custom-select:hover:not(:disabled) {
                    transform: scale(1.02);
                    background-color: #ffffff;
                    border-color: rgba(99, 102, 241, 0.4);
                    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.08);
                    z-index: 2; 
                }
                .custom-input:focus:not(:disabled), .custom-select:focus:not(:disabled) {
                    transform: scale(1.02);
                    background-color: #ffffff;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
                    outline: none;
                    z-index: 3;
                }

                .custom-select { cursor: pointer; appearance: auto; }
                .custom-select option { background-color: #f8fafc; color: #0f172a; font-weight: 500; padding: 12px; font-size: 0.95rem; }
                .custom-select option:hover, .custom-select option:checked { background-color: #e0e7ff; color: #4f46e5; }
                
                @keyframes pulse-dot {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .network-pulse { animation: pulse-dot 2s infinite; }

                .custom-modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(5px);
                    z-index: 9999; display: flex; align-items: center; justify-content: center;
                    opacity: 0; animation: fadeIn 0.2s forwards;
                }
                .custom-modal-content {
                    background: #ffffff; border-radius: 20px; padding: 2rem; max-width: 420px; width: 90%;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); text-align: center;
                    transform: translateY(20px); opacity: 0; animation: slideUp 0.3s 0.1s forwards;
                }
                @keyframes fadeIn { to { opacity: 1; } }
                @keyframes slideUp { to { transform: translateY(0); opacity: 1; } }

                .qr-scale-container {
                    transform: scale(0.85);
                    transform-origin: top center;
                    margin-bottom: -30px; 
                }
                
                .rate-receipt {
                    background: rgba(255,255,255,0.8);
                    border: 1px dashed rgba(16, 185, 129, 0.4);
                    border-radius: 16px;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                }
            `}</style>

            {/* Custom Modal */}
            {modalConfig.isOpen && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-content">
                        <div className="mb-4">
                            {modalConfig.type === 'success' && (
                                <div className="text-success d-inline-flex bg-success bg-opacity-10 p-3 rounded-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>
                                </div>
                            )}
                            {modalConfig.type === 'warning' && (
                                <div className="text-warning d-inline-flex bg-warning bg-opacity-10 p-3 rounded-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                                </div>
                            )}
                            {modalConfig.type === 'error' && (
                                <div className="text-danger d-inline-flex bg-danger bg-opacity-10 p-3 rounded-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>
                                </div>
                            )}
                        </div>
                        <h4 className="fw-bold text-slate-800 mb-2">{modalConfig.title}</h4>
                        <p className="text-slate-500 mb-4">{modalConfig.message}</p>
                        <button onClick={closeModal} className={`btn w-100 rounded-pill py-2 fw-bold text-white shadow-sm ${modalConfig.type === 'success' ? 'btn-success' : modalConfig.type === 'warning' ? 'btn-warning text-dark' : 'btn-danger'}`}>
                            Understood
                        </button>
                    </div>
                </div>
            )}

            <main className="container-fluid vh-100 vw-100 d-flex align-items-center justify-content-center p-3 p-xl-4 m-0 textured-bg" style={{ overflow: 'hidden' }}>
                <div className="card border-0 w-100 h-100 d-flex flex-column" style={{ borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(71, 85, 105, 0.25)', maxWidth: '1800px', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(24px)' }}>
                    
                    <div className="d-flex justify-content-end px-4 py-3 flex-shrink-0 w-100">
                        <div className="d-flex align-items-center gap-2 bg-white bg-opacity-90 px-4 py-2 rounded-pill border border-slate-200 shadow-sm">
                            <span className="bg-success rounded-circle network-pulse" style={{ width: '8px', height: '8px' }}></span>
                            <span className="text-slate-700 fw-bold mb-0" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Network: Active</span>
                        </div>
                    </div>

                    <div className="card-body p-0 h-100 bg-transparent">
                        <form onSubmit={handleSubmit} className="row g-0 h-100 m-0">
                            
                            {/* COLUMN 1: Package Specs */}
                            <div className="col-lg-4 p-4 p-xl-5 h-100 d-flex flex-column gap-3 overflow-hidden border-end" style={{ borderColor: 'rgba(148, 163, 184, 0.3)' }}>
                                <h5 className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: '#4f46e5' }}>
                                    <span className="text-white rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: '28px', height: '28px', fontSize: '14px', backgroundColor: '#4f46e5' }}>1</span>
                                    Package Specifications
                                </h5>
                                
                                <div>
                                    <label className="form-label small fw-bold text-slate-700 mb-1">Reference Name</label>
                                    <input type="text" name="name" value={parcelData.name} onChange={handleChange} className="custom-input" placeholder="e.g. Project Alpha Documents" required />
                                </div>

                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-slate-700 mb-1">Service Type</label>
                                        <select name="serviceType" value={parcelData.serviceType} onChange={handleChange} className="custom-select">
                                            <option value="Domestic">Domestic</option>
                                            <option value="International">International</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-slate-700 mb-1">Category</label>
                                        <select name="itemType" value={parcelData.itemType} onChange={handleChange} className="custom-select" required>
                                            <option value="" disabled>Select Item Type...</option>
                                            <option value="Letter/Document">Letter/Document</option>
                                            <option value="Parcel">Parcel</option>
                                            <option value="Book Packet">Book Packet</option>
                                            <option value="Blind Literature Packet">Blind Literature</option>
                                            <option value="Registered Newspaper">Newspaper</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-3 mt-2 rounded-4 glass-panel position-relative">
                                    <label className="form-label small fw-bold text-slate-700 mb-2">Dimensions (cm) & Weight</label>
                                    <div className="d-flex gap-2 mb-3">
                                        <input type="number" name="length" value={parcelData.length} onChange={handleChange} className="custom-input text-center px-1" placeholder="L" required />
                                        <span className="text-slate-400 align-self-center fw-bold">×</span>
                                        <input type="number" name="breadth" value={parcelData.breadth} onChange={handleChange} className="custom-input text-center px-1" placeholder="B" required />
                                        <span className="text-slate-400 align-self-center fw-bold">×</span>
                                        <input type="number" name="height" value={parcelData.height} onChange={handleChange} className="custom-input text-center px-1" placeholder="H" required />
                                    </div>
                                    <div className="d-flex align-items-center bg-white bg-opacity-70 rounded-3 overflow-hidden border border-slate-300">
                                        <input type="number" name="weight" value={parcelData.weight} onChange={handleChange} className="custom-input border-0 rounded-0 flex-grow-1" style={{ boxShadow: 'none', backgroundColor: 'transparent' }} placeholder="Total Weight" required />
                                        <span className="bg-light px-3 py-2 text-slate-500 fw-medium border-start border-slate-300">grams</span>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 2: Routing Details */}
                            <div className="col-lg-4 p-4 p-xl-5 h-100 d-flex flex-column gap-3 overflow-hidden border-end" style={{ borderColor: 'rgba(148, 163, 184, 0.3)' }}>
                                <h5 className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: '#0ea5e9' }}>
                                    <span className="text-white rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: '28px', height: '28px', fontSize: '14px', backgroundColor: '#0ea5e9' }}>2</span>
                                    Routing Logic
                                </h5>

                                <div className="d-flex flex-column gap-3 flex-grow-1">
                                    {/* Origin Panel */}
                                    <div className="p-3 rounded-4 glass-panel position-relative">
                                        <label className="form-label small fw-bold text-slate-700 mb-2">Origin (Sender) - India</label>
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <input type="text" name="srcPincode" value={parcelData.srcPincode} onChange={handleChange} className="custom-input" placeholder="Origin Pincode / Zip Code" required />
                                            </div>
                                            <div className="col-6">
                                                <select name="srcState" value={parcelData.srcState} onChange={handleChange} className="custom-select" required>
                                                    <option value="" disabled>Select State...</option>
                                                    {srcStatesAvailable.map(state => <option key={state} value={state}>{state}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <select name="srcCity" value={parcelData.srcCity} onChange={handleChange} className="custom-select" required disabled={!parcelData.srcState}>
                                                    <option value="" disabled>Select City...</option>
                                                    {srcCitiesAvailable.map(city => <option key={city} value={city}>{city}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Destination Panel */}
                                    <div className="p-3 rounded-4 flex-grow-1 glass-panel position-relative">
                                        <label className="form-label small fw-bold text-slate-700 mb-2">Destination (Receiver)</label>
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <select name="destCountry" value={parcelData.destCountry} onChange={handleChange} className="custom-select" disabled={parcelData.serviceType === 'Domestic'} required>
                                                    {parcelData.serviceType === 'Domestic' ? (
                                                        <option value="India">India (Domestic)</option>
                                                    ) : (
                                                        <>
                                                            <option value="" disabled>Select Country...</option>
                                                            {Object.keys(locationData).filter(c => c !== "India").map(country => (
                                                                <option key={country} value={country}>{country}</option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="col-12">
                                                <input type="text" name="destPincode" value={parcelData.destPincode} onChange={handleChange} className="custom-input" placeholder="Destination Pincode / Zip Code" required />
                                            </div>
                                            <div className="col-6">
                                                <select name="destState" value={parcelData.destState} onChange={handleChange} className="custom-select" required disabled={!parcelData.destCountry}>
                                                    <option value="" disabled>Select State/Region...</option>
                                                    {destStatesAvailable.map(state => <option key={state} value={state}>{state}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <select name="destCity" value={parcelData.destCity} onChange={handleChange} className="custom-select" required disabled={!parcelData.destState}>
                                                    <option value="" disabled>Select City...</option>
                                                    {destCitiesAvailable.map(city => <option key={city} value={city}>{city}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 3: Action & Validation */}
                            <div className="col-lg-4 p-4 p-xl-5 h-100 d-flex flex-column gap-3 overflow-hidden">
                                 <h5 className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: '#10b981' }}>
                                    <span className="text-white rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: '28px', height: '28px', fontSize: '14px', backgroundColor: '#10b981' }}>3</span>
                                    Finalization
                                </h5>

                                <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center rounded-4 p-4 glass-panel position-relative">
                                    {!parcelId ? (
                                        <div className="text-center w-100">
                                            {estimatedPostage ? (
                                                <div className="rate-receipt text-start">
                                                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-10">
                                                        <span className="small text-slate-500 fw-bold text-uppercase">Chargeable Weight</span>
                                                        <span className="fw-bold text-slate-800">{estimatedPostage.chargeableWeight} kg</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center pt-1">
                                                        <span className="small text-slate-500 fw-bold text-uppercase">Estimated Rate</span>
                                                        {estimatedPostage.isFree ? (
                                                            <span className="fs-5 fw-bolder text-info">Free Postage</span>
                                                        ) : (
                                                            <span className="fs-4 fw-bolder text-success">₹{estimatedPostage.cost}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-4 text-slate-600 small px-3 fw-medium">
                                                    Please complete origin/destination, category, dimensions, and weight to see your estimated rate.
                                                </div>
                                            )}

                                            <button type="submit" className="btn btn-dark btn-lg w-100 rounded-pill shadow-sm" disabled={loading} style={{ padding: '16px 0', backgroundColor: '#0f172a', border: 'none' }}>
                                                {loading ? (
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <span className="spinner-border spinner-border-sm text-light" role="status" aria-hidden="true"></span>
                                                        <span className="fw-medium text-light">Encrypting & Routing...</span>
                                                    </div>
                                                ) : (
                                                    <span className="fw-bold text-light" style={{ letterSpacing: '0.5px' }}>Generate Secure Manifest</span>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center w-100 d-flex flex-column align-items-center">
                                            <h5 className="text-slate-800 fw-bold mb-1">Manifest Secured</h5>
                                            <p className="text-slate-500 small mb-2">Tracking ID: <span className="fw-bold text-indigo-600" style={{ color: '#4f46e5' }}>{parcelId}</span></p>
                                            
                                            <div className="qr-scale-container bg-white p-3 rounded-4 shadow-sm border border-slate-200">
                                                <ParcelQr key={parcelId} parcelId={parcelId} parcelData={parcelData} />
                                            </div>
                                            
                                            <p className="small text-slate-500 mt-4 mb-3 fw-medium">Ready for transit scanning</p>
                                            
                                            <button type="button" onClick={() => { setParcelId(''); resetForm(); }} className="btn btn-outline-dark btn-sm rounded-pill px-4 fw-bold">
                                                Add Another Parcel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AddParcelBody;