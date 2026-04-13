import React, { useRef } from 'react'
import { toast } from 'react-toastify';

const VehicleCurrentStatusCard = ({ vehicleId,vehicleStatus,setVehicleStatus }) => {
    const setTimeoutRef = useRef(null);
    const fetchEnabled = useRef(false)

    async function getVehicleStatus() {
        if (fetchEnabled.current === false) return;
        console.log(`fetching vehicle status...`);

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/location/get-one-truck`
        console.log(`API: ${API}`);

        const body = { id: vehicleId };
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        };

        try{
            const response = await fetch(API, params);
            const data = await response.json();
            console.log(data);

            if(data.status === "success"){
                setVehicleStatus(data.data)
            }else{
                toast.error(data.message)
            }
        }catch(err){
            console.log(err);
        }

    }

    async function startPeriodicallyFetch() {
        setTimeoutRef.current = setInterval(getVehicleStatus, 5000);
        fetchEnabled.current = true;
        toast.success('Vehicle Update Started');
    }

    async function stopPeriodicallyFetch() {
        clearInterval(setTimeoutRef.current);
        fetchEnabled.current = false;
        toast.error('Vehicle Update Stopped');
    }


    return (
        <div className="">
            <div className="card" style={{ minWidth: '300px', minHeight: "400px", margin: 'auto' }}>
                <div className="card-header">
                    <h5 className="card-title mb-0">Vehicle Status</h5>
                </div>

                <div className="card-body">
                    {/* Location Display */}
                    <div className="mb-4">
                        <h6 className="card-subtitle mb-2 text-muted">Current Location:</h6>
                        {/* <p className="mb-1">Latitude: {location.lat.toFixed(6)}</p> */}
                        {/* <p>Longitude: {location.lng.toFixed(6)}</p> */}
                    </div>

                    <div className="mb-3">
                        <button className="btn btn-primary" onClick={startPeriodicallyFetch}>Start Fetching</button>
                        <button className="btn btn-danger ms-2" onClick={stopPeriodicallyFetch}>Stop Fetching</button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default VehicleCurrentStatusCard