import { Parcel, TruckLoadOptimizer } from "@/lib/TruckPackageOptimizer";
import React, { useLayoutEffect, useState } from "react";
import { toast } from "react-toastify";

const ParcelManagement = () => {
    const [allParcel, setAllParcel] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [truckLoad, setTruckLoad] = useState(0);
    const [truckParcels, setTruckParcels] = useState([]);
    const [showTruckParcels, setShowTruckParcels] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasFetchedParcels, setHasFetchedParcels] = useState(false);

    async function fetchParcels() {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/all-parcel`;
        try {
            setLoading(true);
            const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" } })
                .then((res) => res.json());
            if (response.status === "success" && Array.isArray(response.data)) {
                setAllParcel(response.data);
            } else {
                toast.error("Unexpected response format from the server.");
                setAllParcel([]);
            }
            setHasFetchedParcels(true);
        } catch (err) {
            toast.error("Failed to fetch parcels.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchVehicles() {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/all-vehicle`;
        try {
            setLoading(true);
            const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" } })
                .then((res) => res.json());
            if (response.status === "success" && Array.isArray(response.data)) {
                setVehicles(response.data);
            } else {
                toast.error("Unexpected response format from the server.");
                setVehicles([]);
            }
        } catch (err) {
            toast.error("Failed to fetch vehicles.");
        } finally {
            setLoading(false);
        }
    }

    const selectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setTruckLoad(0);
        setTruckParcels([]);
        toast.success(`Selected vehicle: ${vehicle.name}`);
        console.log(`Selected vehicle: ${vehicle.name}`, vehicle)
    };

    const addToTruck = (parcel) => {
        if (truckLoad + Number(parcel.weight) <= parseInt(selectedVehicle.weight)) {
            setTruckLoad(truckLoad + Number(parcel.weight));
            setTruckParcels((prev) => [...prev, parcel]);
            toast.success("Parcel added to truck!");
        } else {
            toast.error("Truck is full! Cannot add more parcels.");
        }
    };

    const toggleTruckParcels = () => {
        setShowTruckParcels(!showTruckParcels);
    };

    // Example Usage
    function demonstrateTruckLoading() {
        // Create truck with dimensions
        const truck = new TruckLoadOptimizer(10, 5, 4);  // 10m length, 5m breadth, 4m height

        // Create sample parcels
        const parcels = [
            new Parcel(1, 2, 1.5, 1),   // 3 cubic meters
            new Parcel(2, 1.5, 1, 2),   // 3 cubic meters
            new Parcel(3, 3, 1, 1),     // 3 cubic meters
            new Parcel(4, 0.5, 0.5, 0.5), // Small parcel
            new Parcel(5, 4, 2, 1.5)    // Larger parcel
        ];

        // Basic volume-based optimization
        const basicResult = truck.optimizeLoading(parcels);
        console.log("Basic Loading Optimization:", basicResult);

        // Advanced 3D packing
        const advancedResult = truck.advancedPacking(parcels);
        console.log("Advanced 3D Packing:", advancedResult);
    }

    useLayoutEffect(() => {
        fetchVehicles();
        if (!hasFetchedParcels) fetchParcels();
    }, []);

    return (
        <main className="container my-2">
            <h1 className="text-center text-dark py-3">Parcel Management System</h1>

            <div className="row my-3">
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                        <div className="col-md-4" key={vehicle.name}>
                            <div
                                className={`card ${selectedVehicle?.name === vehicle.name ? "border-success" : ""} border-2`}
                                onClick={() => selectVehicle(vehicle)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="card-body text-center">
                                    <h5 className="card-title">{vehicle.name}</h5>
                                    <p className="card-text">Capacity: {vehicle.volume.total / 100_00_00} kg</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No vehicles available.</p>
                )}
            </div>

            {selectedVehicle && (
                <>
                    <div className="my-3">
                        <h3>Truck Capacity</h3>
                        <div className="progress" style={{ height: "30px" }}>
                            <div
                                className={`progress-bar ${truckLoad < selectedVehicle.weight ? "bg-success" : "bg-danger"}`}
                                role="progressbar"
                                style={{ width: `${(truckLoad / selectedVehicle.weight) * 100}%` }}
                                aria-valuenow={truckLoad}
                                aria-valuemin="0"
                                aria-valuemax={selectedVehicle.weight}
                            >
                                {truckLoad}kg / {selectedVehicle.weight} kg
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-info my-3" onClick={toggleTruckParcels}>
                        {showTruckParcels ? "Hide Truck Parcels" : "Show Truck Parcels"}
                    </button>

                    <button className="btn btn-dark my-3 ms-3" onClick={demonstrateTruckLoading}>
                        {showTruckParcels ? "Hide Truck Parcels" : "Show Truck Parcels"}
                    </button>

                    {showTruckParcels && (
                        <ul className="list-group my-3">
                            {truckParcels.map((parcel, index) => (
                                <li key={index} className="list-group-item">
                                    {parcel.name} - {parcel.weight}kg
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {selectedVehicle && hasFetchedParcels && allParcel.length > 0 && (
                <div className="table-responsive my-3">
                    <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Length</th>
                                <th>Breadth</th>
                                <th>Height</th>
                                <th>Weight</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allParcel.map((parcel, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{parcel.name}</td>
                                    <td>{parcel.dimensions?.length || "--"}</td>
                                    <td>{parcel.dimensions?.breadth || "--"}</td>
                                    <td>{parcel.dimensions?.height || "--"}</td>
                                    <td>{parcel.weight}kg</td>
                                    <td>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => addToTruck(parcel)}
                                            disabled={truckLoad + parcel.weight > selectedVehicle.volume.total}
                                        >
                                            Add to Truck
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
};

export default ParcelManagement;
