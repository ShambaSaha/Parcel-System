import { useTruckDashboardContext } from '@/context/Final/TruckDashboardContext'
import React, { useEffect, useState, useRef } from 'react'

const BottomPannel = () => {
  const { selectedVehicle } = useTruckDashboardContext();
  const intervalRef = useRef(null);

  const [timeoutDelay] = useState(3000); // 3 seconds
  const [vehicleStatus, setVehicleStatus] = useState([]);
  const [isStatusFetching, setIsStatusFetching] = useState(false);

  // --------------------------------------------- //
  async function fetchStatus() {
    if (!selectedVehicle) return;
    console.log(`Fetching Data for ${selectedVehicle.name}`);

    const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/location/get-one-truck`;
    const data = { id: 'truck' };
    // const data = { id: selectedVehicle._id };
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }

    try {
      const response = await fetch(API, params);
      const result = await response.json();
      console.log(result);

      if (isStatusFetching === false)
        setVehicleStatus((prev) => [...prev, result.data]);

      // scroll to bottom
      const element = document.getElementById('statusDisplayBox');
      element.scrollTop = element.scrollHeight;

    } catch (error) {
      console.error('Error fetching vehicle status:', error);
    }
  }

  function startFetching() {
    if (!intervalRef.current) {
      setVehicleStatus([]);
      setIsStatusFetching(true);
      fetchStatus(); // Fetch immediately
      intervalRef.current = setInterval(fetchStatus, timeoutDelay);
      console.log(`Interval Created`);
    }
  }

  function stopFetching() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsStatusFetching(false);
      setVehicleStatus([]);
      console.log(`Interval Cleared`);
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Clear interval when component unmounts or selected vehicle changes
  useEffect(() => {
    return () => stopFetching();
  }, [selectedVehicle]); // Add selectedVehicle as dependency

  // --------------------------------------------- //






  if (selectedVehicle === null) {
    return (
      <div className="alert alert-danger m-2">
        No Vehicle Selected
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex flex-row gap-1 w-100">

          {/* Vehicle Name and Fetcing Start/Stop Button */}
          <div className='d-flex flex-column gap-1'>
            <span>{selectedVehicle.name} ({selectedVehicle.number})</span>
            {!isStatusFetching ? (
              <button onClick={startFetching} className="btn btn-sm btn-success">Start Fetching</button>
            ) : (
              <button onClick={stopFetching} className="btn btn-sm btn-danger">Stop Fetching</button>
            )}
          </div>
          {/* Vertical Rule Divider */}
          <div className="vr my-2"></div>

          {/* Display latest 3 status of the vehicles */}
          <div id="statusDisplayBox" className="d-flex flex-column gap-1 overflow-auto" style={{ "maxHeight": "25vh" }}>
            {vehicleStatus.map((status, index) => (
              <div key={index} className="border-bottom border-black border-bottom-2">
                <span>{status.lat}, {status.long}</span>
                <span className="ms-1 text-primary">@{new Date(status.timestamp).getTime()}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BottomPannel;