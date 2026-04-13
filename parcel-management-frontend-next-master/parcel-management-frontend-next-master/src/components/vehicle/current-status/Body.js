import React, { useState } from 'react'
import OlaMaps from './OlaMaps'
import VehicleCurrentStatusCard from './StatusCard'

const CurrentStatusBody = () => {
    const [vehicleId, setVehicleId] = useState('truck')
    const [vehicleStatus, setVehicleStatus] = useState({})


    return (
        <main className="container my-3">
            <h1>Current Status of a Vehicle</h1>
            <div className="text-white my-2">
                <span className="bg-primary p-2 py-1 rounded-start-1">ID :</span>
                <span className="bg-secondary p-2 py-1 rounded-end-1">{vehicleId}</span>
            </div>

            <div className="d-flex flex-row gap-1">
                {
                    (vehicleStatus.long !== undefined) &&
                    <OlaMaps vehicleStatus={vehicleStatus} />
                }
                <VehicleCurrentStatusCard vehicleId={vehicleId} vehicleStatus={vehicleStatus} setVehicleStatus={setVehicleStatus} />
            </div>
        </main>
    )
}

export default CurrentStatusBody