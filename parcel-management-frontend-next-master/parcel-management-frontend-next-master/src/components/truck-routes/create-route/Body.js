import decodePolyline from '@/lib/PolylineDecoder';
import { useState } from 'react';
import { toast } from 'react-toastify';
import TruckRouteMap from "./OlaMaps";
import RoutesForm from "./RoutesForm";

const CreateRouteBody = () => {
    const OLA_MAPS_API = 'yPxHRvKgjEkVrjAzVJU733chCWyn0EHVjJRet18G';

    const checkPointSchema = { name: "", lat: "", long: "", type: "post-office" };
    const [allCheckpoints, setAllCheckpoints] = useState([{...checkPointSchema}, {...checkPointSchema}, {...checkPointSchema}]);
    const [routeName, setRouteName] = useState('Route 4');
    const [distanceAndTime, setdistanceAndTime] = useState(null);
    const [allRoutes, setAllRoutes] = useState(null);

    // --- NEW: Forward Geocoding Functions ---
    async function fetchCoordinates(placeName) {
        if (!placeName) return null;
        
        const GEOCODE_API = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(placeName)}&api_key=${OLA_MAPS_API}`;
        
        try {
            const response = await fetch(GEOCODE_API);
            const data = await response.json();

            if (data.status === 'ok' && data.geocodingResults && data.geocodingResults.length > 0) {
                const location = data.geocodingResults[0].geometry.location;
                return { lat: location.lat.toString(), long: location.lng.toString() };
            } else {
                toast.error(`Could not find coordinates for: ${placeName}`);
                return null;
            }
        } catch (error) {
            console.error("Geocoding Error:", error);
            toast.error("Failed to fetch location coordinates.");
            return null;
        }
    }

    async function handleUpdateDynamicCheckpoint(index, placeName, type = "post-office") {
        const coords = await fetchCoordinates(placeName);
        if (!coords) return; 

        setAllCheckpoints(prevCheckpoints => {
            const updatedCheckpoints = [...prevCheckpoints];
            updatedCheckpoints[index] = {
                name: placeName,
                lat: coords.lat,
                long: coords.long,
                type: type
            };
            return updatedCheckpoints;
        });
        
        toast.success(`${placeName} located successfully!`);
    }

    async function resetForm() {
        setAllCheckpoints([{...checkPointSchema},{...checkPointSchema}, {...checkPointSchema}]);
        setAllRoutes(null);
    }

    async function handleSubmit(e) {
    e.preventDefault();
    
    // 1. Validate the checkpoints
    const validCheckpoints = allCheckpoints.filter(cp => cp.lat && cp.long);

    if (validCheckpoints.length < 3) {
        toast.warn('Minimum 3 valid checkpoints with coordinates required to create a Route');
        return;
    }

    // 2. Fetch the route from Ola Maps API
    const fetchedRoutes = await getAllRoute(validCheckpoints);
    if (!fetchedRoutes) {
        toast.error("Failed to calculate route.");
        return;
    }

    // Update the UI state to draw the map
    setAllRoutes(fetchedRoutes);

    // 3. Prepare the data payload for your backend
    const routePayload = {
        routeName: routeName.trim(),
        startLocation: validCheckpoints[0],
        endLocation: validCheckpoints[validCheckpoints.length - 1],
        waypoints: validCheckpoints,
        distance: fetchedRoutes.distanceInKm,
        estimatedTime: fetchedRoutes.timeInHours,
    };

    console.log('Sending data to DB:', routePayload);

    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(routePayload)
    };

    // Make sure NEXT_PUBLIC_BACKEND_URL is defined in your .env.local file!
    const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/truck-routes/create-route`;

    // 4. Send to Database
    try {
        const res = await fetch(API, params);
        const responseData = await res.json();

        if (res.ok) {
            toast.success('Route successfully created and saved to database!');
            console.log("Backend Response:", responseData);
        } else {
            // Handle backend-specific errors (e.g., validation failed)
            toast.error(responseData.message || 'Failed to save route to database.');
            console.error("Backend Error:", responseData);
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        toast.error('Could not connect to the server. Please try again later.');
    }
}

    // --- RESTORED: Your Original Routing Functions ---

    async function calculateDistanseTime(waypoints = []) {
        if (waypoints.length < 2) {
            toast.warn('Minimum 2 checkpoints required to create a Route')
            return false;
        }

        let originsParamsString = '';
        for (let i = 0; i < waypoints.length - 1; i++) {
            originsParamsString += waypoints[i].lat + '%2C' + waypoints[i].long;
            if (i < waypoints.length - 2) {
                originsParamsString += '|';
            }
        }
        
        let destinationsParamsString = '' + waypoints[waypoints.length - 1].lat + '%2C' + waypoints[waypoints.length - 1].long;
        const API = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${originsParamsString}&destinations=${destinationsParamsString}&api_key=${OLA_MAPS_API}`

        try {
            const response = await fetch(API).then((res) => res.json());

            if (response.status !== 'SUCCESS') {
                toast.error('Error from Ola Maps API');
                return;
            }

            const rows = response.rows;
            let shortestPath = null;

            for (let i = 0; i < rows.length; i++) {
                const elements = rows[i].elements;
                for (let j = 0; j < elements.length; j++) {
                    const element = elements[j];
                    if (shortestPath === null || element.duration < shortestPath.duration) {
                        shortestPath = element;
                    }
                }
            }

            const totalDistance = shortestPath.distance;
            const totalTime = shortestPath.duration;
            const distanceInKm = totalDistance / 1000;
            const timeInHours = totalTime / 3600;

            const returnData = { totalTime, totalDistance, distanceInKm, timeInHours, polyline: shortestPath.polyline };
            return returnData;

        } catch (error) {
            toast.error('Distance couldn\'t be fetched');
            return false;
        }
    }

    async function getAllRoute(waypoints = []) {
        console.log('%cgetAllRoute Function', 'color: yellow; font-weight: bold;font-size:20px');

        const pointDiffs = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            const object = {
                from: waypoints[i],
                to: waypoints[i + 1],
            };
            pointDiffs.push(object);
        }

        const allPromises = pointDiffs.map((item) =>
            fetchRoute(item.from.lat, item.from.long, item.to.lat, item.to.long)
        );

        try {
            const allRoutesData = await Promise.all(allPromises);
            console.log("ALL ROUTES FETCHED", allRoutesData);

            let time = 0, distance = 0;
            allRoutesData.forEach((item) => {
                if(item) {
                    time += item.time;
                    distance += item.distance;
                }
            })

            const returnData = {
                time: time,
                distance: distance,
                distanceInKm: distance / 1000,
                timeInHours: time / 3600,
                routes: allRoutesData.filter(Boolean) // Filter out any nulls
            }

            setAllRoutes(returnData)
            return returnData;
        } catch (error) {
            console.error("Error fetching routes", error);
            return null;
        }
    }

    async function fetchRoute(sourceLat, sourceLong, destLat, destLong) {
        const ALTERNATIVE_ROUTE = true;
        const API = `https://api.olamaps.io/routing/v1/directions?origin=${sourceLat}%2C${sourceLong}&destination=${destLat}%2C${destLong}&mode=driving&alternatives=${ALTERNATIVE_ROUTE}&steps=false&overview=full&language=en&traffic_metadata=true&api_key=${OLA_MAPS_API}`;

        const params = {
            method: "POST",
            headers: {
                "accept": "application/json",
            },
        };

        try {
            const response = await fetch(API, params);
            const data = await response.json();

            if (data.status !== "SUCCESS") {
                console.error("ERROR FROM OLA MAPS");
                return null;
            }

            const routes = data.routes;
            const allPoints = routes.map((item) => {
                const timeAndDistance = legsTotalTimeAndDistance(item.legs);
                return ({
                    time: timeAndDistance.time,
                    distance: timeAndDistance.distance,
                    polyline: item.overview_polyline
                })
            });

            let lowest = allPoints[0];
            for (let i = 1; i < allPoints.length; i++) {
                if (lowest.distance > allPoints[i].distance)
                    lowest = allPoints[i];
            }

            return {
                route: lowest,
                time: lowest.time,
                distance: lowest.distance,
                alternateRoutes: allPoints
            }

        } catch (err) {
            console.error(`Error in Fetching Route - OLA MAPS`, err);
            return null;
        }
    }

    function legsTotalTimeAndDistance(legs = []) {
        if (legs.length <= 0) return null;

        let distance = 0, time = 0;
        legs.forEach((item) => {
            distance += Number(item.distance);
            time += Number(item.duration);
        });

        return ({ distance, time });
    }

    // ---- JSX ---- //
    return (
        <main className="container my-3">
            <h1>Create Route</h1>

            <RoutesForm 
                allCheckpoints={allCheckpoints} 
                setAllCheckpoints={setAllCheckpoints} 
                handleSubmit={handleSubmit} 
                resetForm={resetForm} 
                routeName={routeName} 
                setRouteName={setRouteName}
                handleUpdateDynamicCheckpoint={handleUpdateDynamicCheckpoint} 
            />

            {allRoutes && (
                <div className="alert alert-success my-3" role="alert">
                    <p><b>Total Distance</b>: {allRoutes.distanceInKm.toFixed(2)} km</p>
                    <p><b>Total Time</b>: {allRoutes.timeInHours.toFixed(2)} hours</p>
                </div>
            )}
            
            {(allRoutes) && (
                <TruckRouteMap routeData={allRoutes} allPoints={allCheckpoints.filter(cp => cp.lat && cp.long)} allRoutes={allRoutes.routes} />
            )}
        </main>
    );
}

export default CreateRouteBody;