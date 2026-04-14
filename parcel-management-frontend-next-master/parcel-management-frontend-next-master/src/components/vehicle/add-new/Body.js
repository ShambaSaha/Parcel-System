import { calculateVolume } from '@/lib/volumeCalculator';
import { useState } from 'react';

const AddVehicleBody = () => {
    const [vehicle, setVehicle] = useState({ name: "", number: "", length: "", breadth: "", height: "", weight: "", fuelCapacity: "" })
    const [loading, setLoading] = useState(false);

    // Custom Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success' // 'success', 'warning', 'error'
    });

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    async function handleChange(e) {
        setVehicle({ ...vehicle, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(vehicle);

        const totalVolume = calculateVolume(Number(vehicle.length) * 100, Number(vehicle.breadth), Number(vehicle.height) * 100);
        console.log(`totalVolume = ${totalVolume}`);

        const body = {
            ...vehicle,
            length: Number(vehicle.length) * 100,
            breadth: Number(vehicle.breadth) * 100,
            height: Number(vehicle.height) * 100,
            totalVolume,
            status: "IDLE" // ✅ IMPORTANT
        };

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/add-new`;
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }

        try {
            setLoading(true)
            const response = await fetch(API, params);
            const data = await response.json();
            console.log(data);

            if (data.status === "success") {
                setModalConfig({
                    isOpen: true,
                    title: 'Vehicle Registered',
                    message: 'The asset has been successfully added to the operational fleet ledger.',
                    type: 'success'
                });
                clearForm();
            } else {
                setModalConfig({
                    isOpen: true,
                    title: 'Registration Failed',
                    message: data.message || 'An error occurred while attempting to register the vehicle.',
                    type: 'error'
                });
            }
        } catch (err) {
            console.log(err);
            setModalConfig({
                isOpen: true,
                title: 'Network Error',
                message: 'Could not connect to the server. Please check your connection and try again.',
                type: 'error'
            });
        } finally {
            setLoading(false)
        }
    }

    async function clearForm() {
        setVehicle({ name: "", number: "", length: "", breadth: "", height: "", weight: "", fuelCapacity: "" })
    }

    return (
        <>
            <style>{`
                /* Premium Textured Background */
                .textured-bg {
                    background-color: #e2e8f0;
                    background-image: 
                        radial-gradient(at 40% 20%, hsla(228,100%,74%,0.2) 0px, transparent 50%),
                        radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%),
                        radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%),
                        radial-gradient(at 80% 100%, hsla(240,100%,86%,0.3) 0px, transparent 50%),
                        radial-gradient(at 0% 0%, hsla(343,100%,76%,0.15) 0px, transparent 50%);
                }
                
                /* Immersive Glass Card */
                .glass-card {
                    background: rgba(255, 255, 255, 0.65);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 25px 50px -12px rgba(71, 85, 105, 0.25);
                }

                /* Magnetic Buttons */
                .btn-immersive {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                }
                .btn-immersive:hover:not(:disabled) {
                    transform: scale(1.02) translateY(-2px);
                    box-shadow: 0 10px 20px -8px rgba(0, 0, 0, 0.3);
                }
                .btn-immersive:active:not(:disabled) {
                    transform: scale(0.98);
                }

                /* Popping Inputs */
                .custom-input {
                    background-color: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(148, 163, 184, 0.5);
                    border-radius: 10px;
                    padding: 10px 14px;
                    color: #1e293b;
                    font-size: 0.95rem;
                    width: 100%;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .custom-input::placeholder { color: #94a3b8; transition: color 0.3s ease; }
                .custom-input:hover {
                    transform: scale(1.01);
                    background-color: #ffffff;
                    border-color: rgba(99, 102, 241, 0.4);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
                }
                .custom-input:focus {
                    transform: scale(1.01);
                    background-color: #ffffff;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
                    outline: none;
                }

                /* Original Label Styling */
                .form-label { 
                    font-size: 0.85rem; 
                    color: #334155; 
                    font-weight: 700; 
                    margin-bottom: 6px; 
                }

                /* Custom Modal Overlays */
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
                        <button 
                            onClick={closeModal} 
                            className={`btn w-100 rounded-pill py-2 fw-bold text-white shadow-sm ${
                                modalConfig.type === 'success' ? 'btn-success' : 
                                modalConfig.type === 'warning' ? 'btn-warning text-dark' : 'btn-danger'
                            }`}
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}

            <main 
                className="vw-100 vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 m-0 textured-bg overflow-hidden" 
            >
                <div className="card glass-card w-100" style={{ maxWidth: '900px', borderRadius: '24px' }}>
                    <div className="card-body p-4 p-md-5">
                        
                        {/* Original Heading */}
                        <div className="text-center mb-4">
                            <h2 className="fw-bold text-dark">Add New Vehicle</h2>
                            <p className="text-muted small">Enter the vehicle specifications below to add it to the system.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            
                            {/* Row 1: Vehicle Name & Number */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label htmlFor='vehicleName' className="form-label">Vehicle Name</label>
                                    <input value={vehicle.name} onChange={handleChange} name="name" type="text" className="custom-input" id="vehicleName" placeholder="Enter Vehicle Name" required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor='vehicleNumber' className="form-label">Vehicle Number</label>
                                    <input value={vehicle.number} onChange={handleChange} name="number" type="text" className="custom-input" id="vehicleNumber" placeholder="Enter Vehicle Number" required />
                                </div>
                            </div>

                            {/* Row 2: Length, Breadth, Height */}
                            <div className="row g-3 mb-2">
                                <div className="col-md-4">
                                    <label className="form-label">Truck Length (in meter)</label>
                                    <input value={vehicle.length} onChange={handleChange} name="length" type="number" step="any" className="custom-input" placeholder="Enter Vehicle Length" required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Truck Breadth (in meter)</label>
                                    <input value={vehicle.breadth} onChange={handleChange} name="breadth" type="number" step="any" className="custom-input" placeholder="Enter Vehicle Breadth" required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Truck Height (in meter)</label>
                                    <input value={vehicle.height} onChange={handleChange} name="height" type="number" step="any" className="custom-input" placeholder="Enter Vehicle Height" required />
                                </div>
                            </div>

                            {/* Calculated Volume Display */}
                            <div className="d-flex justify-content-end mb-3">
                                <div className="px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <span className="small fw-bold text-slate-600 me-2">Total Cargo Volume:</span>
                                    <span className="small fw-bold" style={{ color: '#4f46e5' }}>
                                        {vehicle.length && vehicle.breadth && vehicle.height 
                                            ? (Number(vehicle.length) * Number(vehicle.breadth) * Number(vehicle.height)).toFixed(2) 
                                            : "0.00"} m³
                                    </span>
                                </div>
                            </div>

                            {/* Row 3: Capacity & Fuel */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">Truck Capacity (in KG)</label>
                                    <input value={vehicle.weight} onChange={handleChange} name="weight" type="number" className="custom-input" placeholder="Enter Maximum Capacity" required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Fuel Capacity</label>
                                    <input value={vehicle.fuelCapacity} onChange={handleChange} name="fuelCapacity" type="number" className="custom-input" placeholder="Enter Fuel Capacity" required />
                                </div>
                            </div>

                            {/* Row 4: Action Buttons */}
                            <div className="d-flex gap-3 mt-3 pt-2 border-top border-light">
                                <button type="submit" className="btn btn-success btn-immersive flex-grow-1 fw-bold py-3 rounded-pill shadow-sm" disabled={loading} style={{ backgroundColor: '#10b981' }}>
                                    {loading ? (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Add New Vehicle'
                                    )}
                                </button>
                                <button type="button" onClick={clearForm} className="btn btn-danger btn-immersive flex-grow-1 fw-bold py-3 rounded-pill shadow-sm" disabled={loading} style={{ backgroundColor: '#ef4444' }}>
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AddVehicleBody;