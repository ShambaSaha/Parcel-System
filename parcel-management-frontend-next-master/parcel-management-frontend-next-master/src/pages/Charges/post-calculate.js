"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

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
        <div className="calc-page-wrapper">
            <style dangerouslySetInnerHTML={{__html: `
                .calc-page-wrapper {
                    min-height: 100vh;
                    background-color: #0f1115;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1rem;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
                .calc-card {
                    background: #1a1d24;
                    border: 1px solid #2d313a;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    padding: 3rem;
                    width: 100%;
                    max-width: 550px;
                    color: #e2e8f0;
                }
                .calc-card h1, .calc-card h2 {
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    font-weight: 700;
                    color: #ffffff;
                    text-align: center;
                }
                .calc-card h1 {
                    font-size: 1.75rem;
                    margin-bottom: 2rem;
                }
                .calc-card h2 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                }
                .form-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #94a3b8;
                    margin-bottom: 0.4rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .custom-input {
                    background-color: #0f1115;
                    border: 1px solid #334155;
                    color: #f8fafc;
                    border-radius: 8px;
                    padding: 0.8rem 1rem;
                    width: 100%;
                    transition: all 0.3s ease;
                }
                .custom-input:focus {
                    background-color: #0f1115;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                    outline: none;
                    color: #ffffff;
                }
                select.custom-input {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 16px;
                }
                .calc-btn {
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    width: 100%;
                    margin-top: 1.5rem;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .calc-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
                }
                .calc-btn:disabled {
                    background: #334155;
                    color: #64748b;
                    cursor: not-allowed;
                }
                .result-container {
                    background: rgba(37, 99, 235, 0.1);
                    border: 1px solid rgba(37, 99, 235, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-top: 2.5rem;
                    text-align: center;
                }
                .result-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 0.5rem 0;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .result-row:last-child {
                    border-bottom: none;
                }
                .result-label {
                    color: #cbd5e1;
                    font-weight: 500;
                }
                .result-value {
                    font-weight: 700;
                    color: #60a5fa;
                    font-size: 1.1rem;
                }
            `}} />

            <div className="calc-card">
                <h1>POSTAL RATE CALCULATOR</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="senderPincode" className="form-label">Sender Pincode</label>
                        <input
                            type="text"
                            id="senderPincode"
                            name="senderPincode"
                            className="custom-input"
                            value={formData.senderPincode}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. 110001"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="receiverPincode" className="form-label">Receiver Pincode</label>
                        <input
                            type="text"
                            id="receiverPincode"
                            name="receiverPincode"
                            className="custom-input"
                            value={formData.receiverPincode}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. 400001"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="weight" className="form-label">Weight (in grams)</label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            className="custom-input"
                            value={formData.weight}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. 250"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="type" className="form-label">Post Type</label>
                        <select
                            id="type"
                            name="type"
                            className="custom-input"
                            value={formData.type}
                            onChange={handleInputChange}
                        >
                            <option value="local">Local</option>
                            <option value="non-local">Non-Local</option>
                        </select>
                    </div>

                    <button type="submit" className="calc-btn" disabled={loading}>
                        {loading ? "CALCULATING..." : "CALCULATE"}
                    </button>
                </form>

                {result && (
                    <div className="result-container">
                        <h2>RESULT</h2>
                        <div className="result-row">
                            <span className="result-label">Distance</span>
                            <span className="result-value">{result.distance} km</span>
                        </div>
                        <div className="result-row">
                            <span className="result-label">Estimated Rate</span>
                            <span className="result-value">₹{result.rate}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostalCalculator;