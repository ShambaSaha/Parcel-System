import React, { useState } from 'react'
import {
    RoutingOptimizer,
    Location,
    Truck,
    Parcel
} from '../../../lib/TruckRouteOptimizer';
// import { generateParcels } from './TestWareHouseData';
import { aStarWithWaypoints } from '../../../lib/TruckRouteOptimizerTwo';

const DynamicRoutingBody = () => {

    const [optimizedRoute, setOptimizedRoute] = useState(null);

    // Example Usage:
    const parcelHubs = [
        { id: 1, name: "Hub 1", numberOfParcels: 100, latitude: 12.9716, longitude: 77.5946 },
        { id: 2, name: "Hub 2", numberOfParcels: 50, latitude: 13.0827, longitude: 80.2707 },
        { id: 3, name: "Hub 3", numberOfParcels: 30, latitude: 12.2958, longitude: 76.6394 },
        { id: 4, name: "Hub 4", numberOfParcels: 70, latitude: 11.0168, longitude: 76.9558 },
        { id: 5, name: "Hub 5", numberOfParcels: 90, latitude: 12.9141, longitude: 74.856 },
    ];

    // Example Usage
    function runRoutingSimulation() {

        const source = 2; // Starting node ID
        const destination = 5; // Destination node ID
        const truckCapacity = 200; // Truck's total capacity
        const maxWaypoints = 2; // Maximum number of waypoints

        const route = aStarWithWaypoints(parcelHubs, source, destination, truckCapacity, maxWaypoints);
        console.log("Optimized Route with Waypoints:", route);
        setOptimizedRoute([...route]);
    }

    function getParcelFromId(id) {
        return parcelHubs.find((parcel) => parcel.id === id);
    }

    // Run the simulation
    // runRoutingSimulation();

    return (
        <main className="container my-3">
            <h1>Dynamic Routing</h1>

            <button onClick={runRoutingSimulation} className='btn btn-primary mb-3'>Route Simulation</button>
            <p>Source :{getParcelFromId(1).name} </p>
            <p>Destination :{getParcelFromId(5).name} </p>

            {
                (optimizedRoute !== null) &&
                <p>
                    <span className='fs-5'>START {"-> "}</span>
                    {optimizedRoute.map((item) => {
                        console.log("item", getParcelFromId(item));
                        return (
                            <span key={item} className='fs-5'>{getParcelFromId(item).name} {"->"}</span>
                        )
                    })}
                    <span className='fs-5'>END</span>
                </p>
            }

            <div className="table-responsive my-4">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>id</th>
                            <th>Name</th>
                            <th>No. of Parcels</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            parcelHubs.map((item) => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.numberOfParcels}</td>
                                        <td>{item.latitude}, {item.longitude}</td>
                                        <td>
                                            <a className='btn btn-sm btn-primary' target='_blank' href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}>View On Map</a>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

            </div>


        </main>
    )
}

export default DynamicRoutingBody