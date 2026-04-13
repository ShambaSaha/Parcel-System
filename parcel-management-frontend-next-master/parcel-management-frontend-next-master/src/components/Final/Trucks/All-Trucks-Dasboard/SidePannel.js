"use client";

import { useTruckDashboardContext } from '@/context/Final/TruckDashboardContext'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const SidePannel = () => {
  const { allVehicles, setAllVehicles, selectedVehicle, setSelectedVehicle } = useTruckDashboardContext()

  const [loading, setLoading] = useState(false);

  async function fetchAllVehicles() {
    const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/all-vehicle`
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      setLoading(true);

      const response = await fetch(API, params).then((res) => res.json());
      console.log(response);

      setAllVehicles(response.data);
      // setHasFetched(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch all Query");
    } finally {
      setLoading(false)
    }
  }

  async function setVehicle(vehicleId) {
    const vehicle = allVehicles.filter((item) => item._id === vehicleId);
    console.log(`Selected Vehicle`, vehicle);

    if (!vehicle || vehicle.length != 1) {
      toast.error("No Matching vehicle found");
      return;
    };

    setSelectedVehicle(vehicle[0]);
  }



  return (
    <div className="card" style={{ "width": "100%", "height": "100%" }}>
      <div className="card-header">
        <h4>All Vehicles</h4>
      </div>
      <div className="card-body">
        <p>
          <span>All Vehicles</span>
          <button onClick={fetchAllVehicles} className="btn btn-sm btn-warning ms-2">Refresh</button>
        </p>

        {/* Display all available vehicles */}
        {
          (allVehicles.length > 0) &&
          <ul className="list-group overflow-y-auto" >
            {allVehicles.map((item) => {
              return <li className={`list-group-item ${(selectedVehicle && selectedVehicle._id == item._id) && "bg-success-subtle"}`} key={item._id}>
                <div className="d-flex w-100 justify-content-between">
                  <div>
                    <span className='fs-6'>{item?.name}</span>
                    <span className='ms-1 '>({item.number})</span>
                  </div>
                  {
                    (selectedVehicle && selectedVehicle._id == item._id) ?
                      <button onClick={() => setSelectedVehicle(null)} className='btn btn-sm btn-danger ms-2' >Un-select</button>
                      :
                      <button onClick={() => setVehicle(item._id)} className='btn btn-sm btn-primary ms-2'>Select</button>
                  }
                </div>
              </li>
            })}
          </ul>
        }

      </div>
    </div>
  )
}

export default SidePannel