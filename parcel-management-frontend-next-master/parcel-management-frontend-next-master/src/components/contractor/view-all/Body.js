import React, { useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewAllContractorBody = () => {
    const [allContractor, setAllContractor] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);


    async function getAllContractor() {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/contractor/all-contractor`;
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
                setAllContractor(response.data);
                setHasFetched(true);
                toast.success('Contractors fetched successfully!');
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
        if (!hasFetched) getAllContractor();
    }, [hasFetched]);

    return (
        <main className="container my-4">
            <h1 className="text-center mb-4">View All Contractors</h1>

            {/* Refresh Button */}
            <div className="text-center mb-3">
                <button
                    className="btn btn-warning"
                    onClick={getAllContractor}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Loading and No Data Message */}
            {loading && <p className="text-center">Loading data...</p>}
            {hasFetched && allContractor.length === 0 && (
                <p className="text-center">No Contractor found.</p>
            )}

            {/* Parcel Data Table */}
            {allContractor.length > 0 && (
                <div
                    className="table-responsive shadow-lg p-3 mb-5 bg-white rounded"
                    style={{ maxHeight: '500px', overflowY: 'auto' }}
                >
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Number</th>
                                <th>Pincode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allContractor.map((contractor, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{contractor.name || 'N/A'}</td>
                                    <td>{contractor.number || 'N/A'}</td>
                                    <td>{contractor.pincode || 'N/A'}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
};

export default ViewAllContractorBody;
