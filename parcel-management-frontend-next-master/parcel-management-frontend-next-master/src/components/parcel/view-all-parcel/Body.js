import React, { useLayoutEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewAllParcelBody = () => {
    const [allParcel, setAllParcel] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Custom Modal State (Replacing react-toastify)
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success' // 'success', 'warning', 'error'
    });

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    async function getAllParcel() {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/all-parcel`;
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            setLoading(true);
            const response = await fetch(API, params).then((res) => res.json());
            console.log(response.data); // Check the structure of data here
            if (response.status === 'success') {
                setAllParcel(response.data);
                setHasFetched(true);
                
                // Show success modal
                setModalConfig({
                    isOpen: true,
                    title: 'Ledger Synced',
                    message: 'Parcels fetched successfully from the network.',
                    type: 'success'
                });
            } else {
                // Show error modal
                setModalConfig({
                    isOpen: true,
                    title: 'Sync Failed',
                    message: response.message || 'Failed to fetch parcels.',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error(err);
            // Show network error modal
            setModalConfig({
                isOpen: true,
                title: 'Network Error',
                message: 'Failed to fetch parcel data. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        if (!hasFetched) getAllParcel();
    }, [hasFetched]);

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

                /* Immersive Glass Animations & Panels */
                .glass-card {
                    background: rgba(255, 255, 255, 0.55);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }

                .btn-immersive {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                }
                .btn-immersive:hover:not(:disabled) {
                    transform: scale(1.05) translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
                }
                .btn-immersive:active:not(:disabled) {
                    transform: scale(0.98);
                }

                @keyframes pulse-dot {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .network-pulse { animation: pulse-dot 2s infinite; }

                /* Custom Floating Table Design */
                .glass-table-wrapper {
                    overflow-y: auto;
                    overflow-x: auto;
                    height: 100%;
                    padding-right: 8px;
                }
                
                /* Custom Scrollbar */
                .glass-table-wrapper::-webkit-scrollbar { width: 6px; height: 6px; }
                .glass-table-wrapper::-webkit-scrollbar-track { background: transparent; }
                .glass-table-wrapper::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.5); border-radius: 10px; }
                .glass-table-wrapper::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.8); }

                .custom-glass-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 12px;
                }
                
                /* Sticky Frosted Header */
                .custom-glass-table th {
                    position: sticky;
                    top: 0;
                    background: rgba(248, 250, 252, 0.85);
                    backdrop-filter: blur(12px);
                    color: #475569;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 0.75rem;
                    padding: 16px;
                    z-index: 10;
                    border-bottom: 1px solid rgba(203, 213, 225, 0.6);
                }

                /* Floating Rows */
                .custom-glass-table td {
                    background: rgba(255, 255, 255, 0.6);
                    padding: 16px;
                    color: #1e293b;
                    font-size: 0.9rem;
                    vertical-align: middle;
                    transition: all 0.3s ease;
                    border-top: 1px solid rgba(255, 255, 255, 0.8);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
                }
                
                /* Row Hover Physics */
                .custom-glass-table tr {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
                }
                .custom-glass-table tbody tr:hover td {
                    background: rgba(255, 255, 255, 0.95);
                    cursor: default;
                }
                .custom-glass-table tbody tr:hover {
                    transform: translateY(-3px) scale(1.005);
                    box-shadow: 0 12px 20px -8px rgba(71, 85, 105, 0.15);
                }

                /* Rounded ends for the row pill-effect */
                .custom-glass-table td:first-child {
                    border-top-left-radius: 12px;
                    border-bottom-left-radius: 12px;
                    border-left: 1px solid rgba(255, 255, 255, 0.8);
                    font-weight: bold;
                    color: #6366f1;
                }
                .custom-glass-table td:last-child {
                    border-top-right-radius: 12px;
                    border-bottom-right-radius: 12px;
                    border-right: 1px solid rgba(255, 255, 255, 0.8);
                }

                /* Status Pill Badges */
                .badge-soft-primary { background-color: rgba(99, 102, 241, 0.15); color: #4f46e5; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.75rem; }
                .badge-soft-info { background-color: rgba(14, 165, 233, 0.15); color: #0284c7; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.75rem; }

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
                className="container-fluid vh-100 vw-100 d-flex align-items-center justify-content-center p-3 p-xl-4 m-0 textured-bg" 
                style={{ overflow: 'hidden' }}
            >
                <div 
                    className="card border-0 w-100 h-100 d-flex flex-column glass-card" 
                    style={{ borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(71, 85, 105, 0.25)', maxWidth: '1800px', overflow: 'hidden' }}
                >
                    {/* Header Top Bar */}
                    <div className="d-flex justify-content-between align-items-center px-4 py-3 flex-shrink-0 w-100 border-bottom border-light">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '40px', height: '40px', backgroundColor: '#4f46e5', color: '#fff' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/></svg>
                            </div>
                            <h4 className="fw-bold text-slate-800 mb-0" style={{ letterSpacing: '-0.5px' }}>Global Network Ledger</h4>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3">
                            <button 
                                onClick={getAllParcel} 
                                disabled={loading}
                                className="btn btn-dark btn-sm rounded-pill px-4 py-2 fw-bold btn-immersive d-flex align-items-center gap-2"
                                style={{ backgroundColor: '#0f172a' }}
                            >
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Syncing...</>
                                ) : (
                                    <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg> Refresh Ledger</>
                                )}
                            </button>
                            <div className="d-flex align-items-center gap-2 bg-white bg-opacity-90 px-4 py-2 rounded-pill border border-slate-200 shadow-sm">
                                <span className="bg-success rounded-circle network-pulse" style={{ width: '8px', height: '8px' }}></span>
                                <span className="text-slate-700 fw-bold mb-0" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Network: Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Body Area - Takes up remaining height perfectly */}
                    <div className="card-body p-4 p-xl-5 d-flex flex-column h-100 overflow-hidden bg-transparent">
                        
                        {/* Loading State */}
                        {loading && !allParcel.length && (
                            <div className="h-100 w-100 d-flex flex-column align-items-center justify-content-center text-slate-500">
                                <span className="spinner-border text-indigo mb-3" style={{ width: '3rem', height: '3rem', color: '#4f46e5' }} role="status"></span>
                                <h6 className="fw-bold">Decrypting Secure Ledger...</h6>
                            </div>
                        )}

                        {/* Empty State */}
                        {hasFetched && allParcel.length === 0 && !loading && (
                            <div className="h-100 w-100 d-flex flex-column align-items-center justify-content-center text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="mb-3 opacity-50" viewBox="0 0 16 16"><path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/></svg>
                                <h5>No active consignments found in the network.</h5>
                            </div>
                        )}

                        {/* Immersive Floating Table */}
                        {allParcel.length > 0 && (
                            <div className="glass-table-wrapper">
                                <table className="custom-glass-table">
                                    <thead>
                                        <tr>
                                            <th>ID Code</th>
                                            <th>Reference Name</th>
                                            <th>Service Protocol</th>
                                            <th>Category</th>
                                            <th>Origin Node</th>
                                            <th>Destination Node</th>
                                            <th>Specs (L×W×H)</th>
                                            <th>Mass (g)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allParcel.map((parcel, index) => (
                                            <tr key={index}>
                                                <td>#{String(index + 1).padStart(4, '0')}</td>
                                                <td className="fw-bold text-slate-800">{parcel.name || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge-soft-${parcel.serviceType === 'International' ? 'info' : 'primary'}`}>
                                                        {parcel.serviceType || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="text-slate-600 fw-medium">{parcel.itemType || 'N/A'}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="bg-info rounded-circle" style={{width:'8px', height:'8px'}}></span>
                                                        {parcel.sender?.city || 'N/A'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="bg-success rounded-circle" style={{width:'8px', height:'8px'}}></span>
                                                        {parcel.receiver?.city || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="text-slate-500 font-monospace small">
                                                    {parcel.dimensions?.length || '0'}×{parcel.dimensions?.breadth || '0'}×{parcel.dimensions?.height || '0'} cm
                                                </td>
                                                <td className="fw-bold text-slate-700">
                                                    {parcel.weight || '0'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default ViewAllParcelBody;