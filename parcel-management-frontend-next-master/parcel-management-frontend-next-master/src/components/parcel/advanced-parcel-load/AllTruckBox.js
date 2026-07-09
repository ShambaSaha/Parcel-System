import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const AllTruckBox = ({ allTrucks, getAllTruck, selectedVehicle, setSelectedVehicle }) => {

    const [loading, setLoading] = useState(false);
    const [vehicle, setVehicle] = useState(null);

    async function handleChange(e) {
        let vehicle = allTrucks.filter((item) => item._id === e.target.value);
        vehicle = (vehicle) ? vehicle[0] : ''

        console.log(`selectingVehicle: ${vehicle?.name}`, vehicle)
        const routeId = vehicle?.routeId;
        const route = await fetchRoute(routeId);


        setSelectedVehicle({ ...vehicle, waypoints: route?.waypoints })
    }

    async function fetchRoute(routeId) {
        // If the truck doesn't have a routeId, don't even try to fetch (saves an error!)
        if (!routeId) return false;

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/truck-routes/get-one-route`;
        const body = { id: routeId };
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }

        try {
            setLoading(true);
            const res = await fetch(API, params).then(res => res.json());
            console.log(res);
            
            if (res.status === 'success') {
                // toast.success("Route fetched successfully"); <-- Removed popup
                setLoading(false);
                return res.data;
            } else {
                // toast.error("Failed to fetch route"); <-- Removed popup
                setLoading(false);
                return false;
            }
        } catch (error) {
            console.log("Error fetching route for truck:", error);
            // toast.error("Failed to fetch route"); <-- Removed popup
            setLoading(false);
            return false;
        } finally {
            setLoading(false);
        }
    }



    return (
        <div className="my-3">
            <select className="form-select" value={(selectedVehicle === '') ? '' : selectedVehicle?._id} onChange={handleChange}>
                {allTrucks.length > 0 && (
                    <option value=''>-- No Vehicle selected --</option>
                )}

                {allTrucks.length === 0 && (
                    <option value=''>No trucks available</option>
                )}

                {allTrucks.map((truck, index) => (
                    <option key={index} value={truck._id}>
                        {truck.name} ({truck.number})
                    </option>
                ))}
            </select>

            {(selectedVehicle !== '') &&
                <div className="my-2 d-flex flex-row gap-2 w-100 border-bottom border-2 pb-2">
                    <div className="d-flex flex-column w-100">
                        <p className="mb-1"><b>Name :</b> {selectedVehicle?.name}</p>
                        <p className="mb-1"><b>Number :</b> {selectedVehicle?.number}</p>
                        <p className="mb-1"><b>Fuel Capacity :</b> {selectedVehicle?.fuelCapacity} L</p>
                        <p className="mb-1"><b>Route ID :</b> {selectedVehicle?.routeId}</p>
                        <p className="mb-1"><b>Route : </b>{selectedVehicle?.waypoints?.map((point, i) => {
                            return (<span title={`${point?.lat}, ${point?.long}`} key={i}>
                                <a href={`https://www.google.com/maps?q=${point?.lat},${point?.long}`}
                                    className="link-primary" target='_blank' >{point.name}</a>
                                {(i !== selectedVehicle.waypoints.length - 1) &&
                                    <span> &rarr; </span>}
                            </span>)
                        })}</p>

                    </div>

                    {/* Vertical Rule in Bootsrap */}
                    <div className=" vr"></div>

                    <div className="d-flex flex-column w-100">
                        <p className='mb-1 fs-5 text-decoration-underline'>Max Volume</p>
                        <span className="mb-1">{selectedVehicle?.volume.total} cm<sup>3</sup></span>
                        <span className="mb-1">{selectedVehicle?.volume.length} x {selectedVehicle?.volume.breadth} x {selectedVehicle?.volume.height}  cm</span>
                        <hr />
                        {/* <p className='mb-1 fs-5 text-decoration-underline'>Remaining Volume</p>
                        <span className="mb-1">{selectedVehicle?.remainingVolume.total} cm<sup>3</sup></span>
                        <span className="mb-1">{selectedVehicle?.remainingVolume.length} x {selectedVehicle?.remainingVolume.breadth} x {selectedVehicle?.remainingVolume.height}  cm</span> */}
                    </div>
                </div>}


        </div>
    )
}

export default AllTruckBox