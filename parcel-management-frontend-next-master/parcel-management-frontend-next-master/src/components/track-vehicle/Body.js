"use client";

import OlaMapsComponent from './OlaMaps';
import VirtualCarController from './VirtualContoller';

const TrackVehicleBody = () => {

    return (
        <div className="d-flex flex-row gap-2 justify-content-center align-items-start">
            <OlaMapsComponent />
            <VirtualCarController />
        </div>
    )
}

export default TrackVehicleBody