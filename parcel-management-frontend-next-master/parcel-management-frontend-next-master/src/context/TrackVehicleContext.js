import { createContext, useContext, useRef, useState } from "react";

const TrackVehicleContext = createContext();

const TrackVehicleProvider = ({ children }) => {
    const [location, setLocation] = useState({
        lat: 22.4954896, lng: 88.3684946
    });
    const locationRef = useRef(location);

    return (
        <TrackVehicleContext.Provider value={{ location, setLocation, locationRef }}>
            {children}
        </TrackVehicleContext.Provider>
    );
};

const useTrackVehicleContext = () => {
    const context = useContext(TrackVehicleContext);

    if (!context) {
        throw new Error('useTrackVehicleContext must be used within a TrackVehicleProvider');
    }

    return context;
}

export { TrackVehicleContext, TrackVehicleProvider, useTrackVehicleContext };