"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PostalCalculator = () => {
    const [formData, setFormData] = useState({
        senderPincode: "",
        receiverPincode: "",
        weight: "",
        type: "local",
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_KEY = "yPxHRvKgjEkVrjAzVJU733chCWyn0EHVjJRet18G"; // Ola Maps API Key

    // Function to fetch coordinates from Ola Maps API
    const getCoordinates = async (pincode) => {
        try {
            const formattedPincode = pincode.replace(/\s+/g, ""); // Remove spaces
            console.log(`Fetching coordinates for pincode: ${formattedPincode}`);

            if (!/^\d{6}$/.test(formattedPincode)) {
                throw new Error("Invalid pincode format. Please enter a valid 6-digit pincode.");
            }

            // Make a request to Ola Maps API to get the coordinates for the given pincode
            const response = await axios.get(
                `https://maps.ola.com/geocode/v1/json?query=${formattedPincode}&key=${API_KEY}`
            );

            console.log("Ola Maps API Response:", response.data); // Log full API response for debugging

            if (response.data && response.data.results && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                return { lat: location.lat, lng: location.lng };
            } else {
                throw new Error(`Unable to find location for pincode: ${formattedPincode}`);
            }
        } catch (err) {
            console.error(`Error fetching coordinates for pincode ${pincode}:`, err.message || err);
            toast.error(`Error fetching coordinates for pincode: ${pincode}`);
            throw err; 
        }
    };

    // Function to calculate distance between two points using the Haversine formula
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    };

    // Function to calculate postal rate based on distance and weight
    const calculatePostalRate = (distance, weight, type) => {
        let rate = 0;

        if (type === "local") {
            if (weight <= 50) rate = 18;
            else if (weight <= 200) rate = 30;
            else if (weight <= 500) rate = 35;
            else if (weight <= 1000) rate = 47;
            else rate = 59 + (Math.ceil((weight - 1000) / 500) * 12); // For weights > 1000 grams
        } else {
            // Non-local rates based on distance
            if (distance <= 200) {
                if (weight <= 50) rate = 41;
                else if (weight <= 200) rate = 41;
                else if (weight <= 500) rate = 59;
                else rate = 77 + (Math.ceil((weight - 1000) / 500) * 12);
            } else if (distance <= 1000) {
                if (weight <= 50) rate = 41;
                else if (weight <= 200) rate = 47;
                else if (weight <= 500) rate = 71;
                else rate = 106 + (Math.ceil((weight - 1000) / 500) * 18);
            } else {
                if (weight <= 50) rate = 41;
                else if (weight <= 200) rate = 71;
                else if (weight <= 500) rate = 94;
                else rate = 142 + (Math.ceil((weight - 1000) / 500) * 24);
            }
        }

        return rate;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const { senderPincode, receiverPincode, weight, type } = formData;

        try {
            setLoading(true);
            setResult(null); // Clear previous result before new calculation

            // Fetch coordinates for both sender and receiver pincodes
            const senderCoords = await getCoordinates(senderPincode);
            const receiverCoords = await getCoordinates(receiverPincode);

            // Calculate distance between sender and receiver
            const distance = calculateDistance(
                senderCoords.lat,
                senderCoords.lng,
                receiverCoords.lat,
                receiverCoords.lng
            );

            // Calculate postal rate
            const rate = calculatePostalRate(distance, parseFloat(weight), type);

            setResult({ distance: distance.toFixed(2), rate });
            toast.success("Calculation successful!");
        } catch (err) {
            toast.error("An error occurred during the calculation.");
        } finally {
            setLoading(false);
        }
    };

    // Handle input change in the form
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="container my-4">
            <h1>Postal Rate Calculator</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="senderPincode" className="form-label">Sender Pincode</label>
                    <input
                        type="text"
                        id="senderPincode"
                        name="senderPincode"
                        className="form-control"
                        value={formData.senderPincode}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="receiverPincode" className="form-label">Receiver Pincode</label>
                    <input
                        type="text"
                        id="receiverPincode"
                        name="receiverPincode"
                        className="form-control"
                        value={formData.receiverPincode}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="weight" className="form-label">Weight (in grams)</label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        className="form-control"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Post Type</label>
                    <select
                        id="type"
                        name="type"
                        className="form-select"
                        value={formData.type}
                        onChange={handleInputChange}
                    >
                        <option value="local">Local</option>
                        <option value="non-local">Non-Local</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Calculating..." : "Calculate"}
                </button>
            </form>

            {result && (
                <div className="mt-4">
                    <h2>Result</h2>
                    <p><strong>Distance:</strong> {result.distance} km</p>
                    <p><strong>Rate:</strong> ₹{result.rate}</p>
                </div>
            )}
        </div>
    );
};

export default PostalCalculator;
