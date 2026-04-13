import { createContext, useContext, useState } from "react";

const TruckDashboardContext = createContext();

const TruckDashboardProvider = ({ children }) => {
    const [allVehicles, setAllVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    return <TruckDashboardContext.Provider value={{
        allVehicles, setAllVehicles, selectedVehicle, setSelectedVehicle
    }}>
        {children}
    </TruckDashboardContext.Provider>
}

const useTruckDashboardContext = () => {
    const context = useContext(TruckDashboardContext);

    if (!context) {
        throw new Error('useTruckDashboardContext must be used within a TruckDashboardProvider');
    }

    return context;
}

export { TruckDashboardContext, TruckDashboardProvider, useTruckDashboardContext };
