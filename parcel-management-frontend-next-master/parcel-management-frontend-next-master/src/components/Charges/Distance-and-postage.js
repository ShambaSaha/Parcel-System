"use client";

import React, { useLayoutEffect, useRef, useState } from 'react';
import { OlaMaps } from '../../../public/olamaps/olamaps-js-sdk.es';
import { toast } from 'react-toastify';

const DistanceAndPostageBody = () => {
    const OLA_MAPS_API = 'yPxHRvKgjEkVrjAzVJU733chCWyn0EHVjJRet18G';

    const olaMaps = useRef(null);
    const [sourcePin, setSourcePin] = useState('');
    const [destinationPin, setDestinationPin] = useState('');
    const [weight, setWeight] = useState(''); // Added state for weight input
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [loading, setLoading] = useState(false);
    const [postalRate, setPostalRate] = useState(null); // Added state for postal rate

    async function initializeOlaMaps() {
        const _olaMaps = new OlaMaps({
            apiKey: OLA_MAPS_API,
        });

        olaMaps.current = _olaMaps;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (sourcePin.length < 6 || destinationPin.length < 6) {
            toast.error('Invalid PIN code');
            return;
        }

        const sourcePostOffice = await getPostDetails(sourcePin);
        if (!sourcePostOffice) {
            toast.error('Invalid source PIN code');
            return;
        }

        const destinationPostOffice = await getPostDetails(destinationPin);
        if (!destinationPostOffice) {
            toast.error('Invalid destination PIN code');
            return;
        }
        console.log(sourcePostOffice)
        console.log(destinationPostOffice)
        const API = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${sourcePostOffice.Latitude}%2C${sourcePostOffice.Longitude}&destinations=${destinationPostOffice.Latitude}%2C${destinationPostOffice.Longitude}&api_key=${OLA_MAPS_API}`;

        try {
            setLoading(true);
            const response = await fetch(API).then((res) => res.json());

            if (response.status !== 'SUCCESS') {
                toast.error('Error from Ola Maps API');
                return;
            }

            const data = response.rows[0].elements[0];
            setDuration(data.duration);
            setDistance(data.distance);

            // Calculate postal rate
            const weightInGrams = parseFloat(weight) * 1000; // Convert kg to grams
            const isLocal = sourcePin.substring(0, 3) === destinationPin.substring(0, 3);
            const rate = calculatePostalRate(distance / 1000, weightInGrams, isLocal ? 'local' : 'non-local');
            setPostalRate(rate);

        } catch (error) {
            toast.error('Distance couldn\'t be fetched');
        } finally {
            setLoading(false);
        }
    }
    
    async function getPostDetails(pincode) {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/post/search-post`;
        const data = {
            'Pincode': pincode
        };

        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

        try {
            setLoading(true);
            const response = await fetch(API, params).then((res) => res.json());
            const data = response.data;
            if (data.length === 0) return false;
            toast.success(`Fetched post details for ${pincode}`);
            return data[0];

        } catch (error) {
            toast.error(`Couldn't fetch post details for ${pincode}`);
            return false;
        } finally {
            setLoading(false);
        }
    }

    function calculatePostalRate(distance, weight, type) {
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

    useLayoutEffect(() => {
        if (olaMaps.current == null) {
            initializeOlaMaps();
        }

        return () => {
            olaMaps.current = null;
        };
    }, []);

    return (
        <main className="container my-3">
            <h1>Distance and Postage Calculator</h1>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label className="form-label">Source PIN</label>
                    <input value={sourcePin} onChange={(e) => setSourcePin(e.target.value)}
                        type='text' className="form-control" required />
                </div>
                <div className='mb-3'>
                    <label className="form-label">Destination PIN</label>
                    <input value={destinationPin} onChange={(e) => setDestinationPin(e.target.value)}
                        type='text' className="form-control" required />
                </div>
                <div className='mb-3'>
                    <label className="form-label">Weight (in kg)</label>
                    <input value={weight} onChange={(e) => setWeight(e.target.value)}
                        type='number' className="form-control" required />
                </div>
                <button type="submit" className="btn btn-success">Submit</button>
            </form>

            {loading && <div>Loading...</div>} {/* Show loading message */}

            {distance && (
                <div className="mt-3">
                    <h3>Results:</h3>
                    <p><strong>Distance:</strong> {distance / 1000} km</p>
                    <p><strong>Duration:</strong> {duration} minutes</p>
                    <p><strong>Postal Rate:</strong> ₹{postalRate}</p>
                </div>
            )}
        </main>
    );
}
export default DistanceAndPostageBody