import React, { useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewAllParcelBody = () => {
    const [allParcel, setAllParcel] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);

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
                toast.success('Parcels fetched successfully!');
            } else {
                toast.error(response.message || 'Failed to fetch parcels.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch parcel data. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        if (!hasFetched) getAllParcel();
    }, [hasFetched]);

    return (
        <main className="container my-4">
            <h1 className="text-center mb-4">View All Parcels</h1>

            {/* Refresh Button */}
            <div className="text-center mb-3">
                <button
                    className="btn btn-warning"
                    onClick={getAllParcel}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Loading and No Data Message */}
            {loading && <p className="text-center">Loading data...</p>}
            {hasFetched && allParcel.length === 0 && (
                <p className="text-center">No parcels found.</p>
            )}

            {/* Parcel Data Table */}
            {allParcel.length > 0 && (
                <div
                    className="table-responsive shadow-lg p-3 mb-5 bg-white rounded"
                    style={{ maxHeight: '500px', overflowY: 'auto' }}
                >
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Service Type</th>
                                <th>Item Type</th>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Dimensions (L×W×H)</th>
                                <th>Weight (g)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allParcel.map((parcel, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{parcel.name || 'N/A'}</td>
                                    <td>{parcel.serviceType || 'N/A'}</td>
                                    <td>{parcel.itemType || 'N/A'}</td>
                                    <td>{parcel.sender?.city || 'N/A'}</td>
                                    <td>{parcel.receiver?.city || 'N/A'}</td>
                                    <td>
                                        {parcel.dimensions?.length || 'N/A'} ×{' '}
                                        {parcel.dimensions?.breadth || 'N/A'} ×{' '}
                                        {parcel.dimensions?.height || 'N/A'} cm
                                    </td>
                                    <td>{parcel.weight || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
};

export default ViewAllParcelBody;
