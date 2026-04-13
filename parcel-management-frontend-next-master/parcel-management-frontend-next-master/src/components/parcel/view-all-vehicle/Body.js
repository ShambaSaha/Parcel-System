import React, { useLayoutEffect, useState } from 'react'
import { toast } from 'react-toastify';

const ViewAllVehicleBody = () => {
    const [allVehicle, setAllVehicle] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);


    async function getAllParcel() {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/all-parcel`
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        };

        try {
            setLoading(true);

            const response = await fetch(API, params).then((res) => res.json());
            console.log(response);

            setAllParcel(response.data);
            setHasFetched(true);
            setLoading(false);
        } catch (err) {
            console.log(err);
            toast.error("Failed to fetch all Query");
        } finally {
            setLoading(false)
        }
    }


    useLayoutEffect(() => {
        if (!hasFetched)
            getAllParcel();
    }, [])


    return (
        <main className="container my-2">
            <h1>View All Parcel</h1>


            {(hasFetched && allParcel.length === 0) && <p>No parcels found.</p>}

            <button className="btn btn-warning" onClick={getAllParcel}>Refresh Data</button>

            {loading && <span className='mx-2'>Loading...</span>}


            {
                (hasFetched && allParcel.length > 0) &&
                <div className="table-responsive my-2">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Length</th>
                                <th>Breadth</th>
                                <th>Height</th>
                                <th>Weight</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                allParcel.map((parcel, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{parcel.name}</td>
                                        <td>{parcel.length}</td>
                                        <td>{parcel.breadth}</td>
                                        <td>{parcel.height}</td>
                                        <td>{parcel.weight}</td>
                                    </tr>))
                            }
                        </tbody>
                    </table>
                </div>
            }
        </main>
    )
}

export default ViewAllVehicleBody