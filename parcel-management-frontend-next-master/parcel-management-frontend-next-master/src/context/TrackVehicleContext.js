import { createContext, useContext, useRef, useState, useEffect } from "react";

const TrackVehicleContext = createContext();

const TrackVehicleProvider = ({ children }) => {
    // 1. Existing Location State
    const [location, setLocation] = useState({
        lat: 22.4954896, lng: 88.3684946
    });
    const locationRef = useRef(location);

    // Keep the ref perfectly synced with the state whenever location changes
    useEffect(() => {
        locationRef.current = location;
    }, [location]);

    // 2. NEW: Route State (Shared between VirtualController and LiveTrackingMap)
    const [selectedRoute, setSelectedRoute] = useState(null);

    return (
        <TrackVehicleContext.Provider value={{ 
            location, 
            setLocation, 
            locationRef,
            selectedRoute,     // <-- Added
            setSelectedRoute   // <-- Added
        }}>
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