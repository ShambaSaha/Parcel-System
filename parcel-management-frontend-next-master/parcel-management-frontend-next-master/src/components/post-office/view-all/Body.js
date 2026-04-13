"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

const ViewAllPostOffices = () => {
  const [searchPincode, setSearchPincode] = useState("");
  const [postOffices, setPostOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchPostOfficesByPincode() {
    const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/post/allpost`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: searchPincode }),
    };

    try {
      setLoading(true);
      const response = await fetch(API, params).then((res) => res.json());
      console.log(response);

      if (response.status === "success") {
        const filteredPostOffices = response.data.filter(
          (office) => office.pin === searchPincode
        );

        if (filteredPostOffices.length === 0) {
          toast.info("No post offices found for the given pincode");
        }

        setPostOffices(filteredPostOffices);
      } else {
        toast.error(response.message || "Failed to fetch post office data");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while fetching post offices");
    } finally {
      setLoading(false);
    }
  }

  function openInMap(lat, long) {
    if (!lat || !long) {
      toast.error("Invalid coordinates");
      return;
    }
    const mapUrl = `https://www.google.com/maps?q=${lat},${long}`;
    window.open(mapUrl, "_blank");
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(searchPincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    searchPostOfficesByPincode();
  };

  return (
    <main className="container my-5">
      <h1 className="text-center mb-4">Search Post Offices by Pincode</h1>

      <form onSubmit={handleSearch} className="my-3 d-flex justify-content-center">
        <div className="input-group w-50">
          <input
            type="text"
            placeholder="Enter 6-digit Pincode"
            className="form-control"
            value={searchPincode}
            onChange={(e) => setSearchPincode(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {loading && <span className="mx-2 d-block text-center">Loading...</span>}

      {postOffices.length > 0 && (
        <div className="table-responsive my-4">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Pin</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {postOffices.map((office, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{office.name}</td>
                  <td>{office.pin}</td>
                  <td>
                    {office.lat}, {office.long}
                  </td>
                  <td>
                    <button
                      onClick={() => openInMap(office.lat, office.long)}
                      title={`Show location for ${office.name}`}
                      className="btn btn-sm btn-success"
                    >
                      Show in Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {postOffices.length === 0 && !loading && (
        <p className="my-2 text-center">No results found. Try searching with another pincode.</p>
      )}
    </main>
  );
};

export default ViewAllPostOffices;
