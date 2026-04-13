import decodePolyline from '@/lib/PolylineDecoder';
import { useState } from 'react';
import { toast } from 'react-toastify';
import TruckRouteMap from "./OlaMaps"
import RoutesForm from "./RoutesForm"

const CreateRouteBody = () => {
    const OLA_MAPS_API = 'yPxHRvKgjEkVrjAzVJU733chCWyn0EHVjJRet18G';

    const testingCheckPoints = [
        { name: "P1", lat: "24.1221169", long: "88.2487969", type: "post-office" },
        { name: "P2", lat: "23.98238", long: "88.24307", type: "parcel-hub" },
        { name: "P3", lat: "23.251528", long: "88.146856", type: "post-office" },
    ];
    const [allCheckpoints, setAllCheckpoints] = useState([...testingCheckPoints]);
    const checkPointSchema = { name: "", lat: "", long: "", type: "post-office" };
    const [routeName, setRouteName] = useState('Route 4');
    // const [allCheckpoints, setAllCheckpoints] = useState([checkPointSchema]);
    const [distanceAndTime, setdistanceAndTime] = useState(null);
    const [allRoutes, setAllRoutes] = useState(null)



    async function resetForm() {
        setAllCheckpoints([checkPointSchema])
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log("all checkpoints", allCheckpoints);
        if (allCheckpoints.length < 2) {
            toast.warn('Minimum 2 checkpoints required to create a Route')
            return;
        }

        const allRoutes = await getAllRoute(allCheckpoints);
        if (!allRoutes) return;
        console.log(allRoutes)

        setAllRoutes(allRoutes);
        return;

        const distanceAndTime = await calculateDistanseTime(allCheckpoints);
        if (!distanceAndTime) return;
        console.log(distanceAndTime);
        return;
        const data = {
            routeName: routeName.trim(),
            startLocation: allCheckpoints[0],
            endLocation: allCheckpoints[allCheckpoints.length - 1],
            waypoints: [...allCheckpoints],
            distance: distanceAndTime.distanceInKm,
            estimatedTime: distanceAndTime.timeInHours,
        }

        return;
        console.log('data', data);
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/truck-routes/create-route`

        try {
            const res = await fetch(API, params).then(res => res.json())
            console.log(res);

            toast.success('Route created successfully');

        } catch (err) {
            console.log(err);
            toast.error('Something went wrong. Please try again later.')
        }

        // const res = await fetch(API, params).then(res => res.json())
        // console.log(res)

    }

    async function calculateDistanseTime(waypoints = []) {
        if (waypoints.length < 2) {
            toast.warn('Minimum 2 checkpoints required to create a Route')
            return false;
        }

        console.log('%cCalculating Distance & Time', 'color: #007bff; font-weight: bold;font-size:20px')
        console.log(waypoints);

        // const API = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${sourcePostOffice.Latitude}%2C${sourcePostOffice.Longitude}&destinations=${destinationPostOffice.Latitude}%2C${destinationPostOffice.Longitude}&api_key=${OLA_MAPS_API}`;

        // create a GEt parameter string with all the lattitude and longitudes of the waypoints except the last one. Cause we need the last one as destination
        let originsParamsString = '';
        for (let i = 0; i < waypoints.length - 1; i++) {
            originsParamsString += waypoints[i].lat + '%2C' + waypoints[i].long;
            if (i < waypoints.length - 2) {
                originsParamsString += '|';
            }
        }
        console.log(originsParamsString)
        let destinationsParamsString = '' + waypoints[waypoints.length - 1].lat + '%2C' + waypoints[waypoints.length - 1].long;

        console.log(destinationsParamsString)

        const API = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${originsParamsString}&destinations=${destinationsParamsString}&api_key=${OLA_MAPS_API}`

        try {
            const response = await fetch(API).then((res) => res.json());

            // console.log(response)
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

            console.log(shortestPath)
            const totalDistance = shortestPath.distance;
            const totalTime = shortestPath.duration;

            const distanceInKm = totalDistance / 1000;
            const timeInHours = totalTime / 3600;

            // console.log(`%cTotal Distance: ${distanceInKm} km`, 'color: yellow; font-weight: bold;')
            // console.log(`%cTotal Time: ${timeInHours} hours`, 'color: yellow; font-weight: bold;')

            // console.log(`%cTotal Distance: ${totalDistance} meters`, 'color: yellow; font-weight: bold;')
            // console.log(`%cTotal Time: ${totalTime} seconds`, 'color: yellow; font-weight: bold;')

            const returnData = { totalTime, totalDistance, distanceInKm, timeInHours, polyline: shortestPath.polyline };

            // setdistanceAndTime(returnData);
            return returnData;

        } catch (error) {
            toast.error('Distance couldn\'t be fetched');
            return false;
        }



        console.log(`%c${'-'.repeat(50)}`, 'color: #007bff; font-weight: bold;')
        return false;


    }

    async function getAllRoute(waypoints = []) {
        console.log('%cgetAllRoute Function', 'color: yellow; font-weight: bold;font-size:20px');
        // console.log(waypoints);

        const pointDiffs = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            const object = {
                from: waypoints[i],
                to: waypoints[i + 1],
            };
            pointDiffs.push(object);
        }
        // console.log(pointDiffs);

        // Create an array of promises for parallel execution
        const allPromises = pointDiffs.map((item) =>
            fetchRoute(item.from.lat, item.from.long, item.to.lat, item.to.long)
        );

        try {
            // Wait for all promises to resolve
            const allRoutes = await Promise.all(allPromises);
            console.log("ALL ROUTES FETCHED");
            console.log(allRoutes);

            let time = 0, distance = 0;
            allRoutes.map((item) => {
                time += item.time;
                distance += item.distance;
            })

            const returnData = {
                time: time,
                distance: distance,
                distanceInKm: distance / 1000,
                timeInHours: time / 3600,
                routes: allRoutes
            }

            setAllRoutes(returnData)

            return returnData; // Return the resolved routes if needed
        } catch (error) {
            console.error("Error fetching routes", error);
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

            // console.log(data);

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
            // console.log('allPoints', allPoints);

            // get the lowest of the three 
            let lowest = allPoints[0];
            for (let i = 1; i < allPoints.length; i++) {
                if (lowest > allPoints[i].distance)
                    lowest = allPoints[i];
            }

            return {
                route: lowest,
                time: lowest.time,
                distance: lowest.distance,
                alternateRoutes: allPoints
            }

            return routes; // Return the routes
        } catch (err) {
            console.error(`Error in Fetching Route - OLA MAPS`, err);
            return null;
        }
    }

    function legsTotalTimeAndDistance(legs = []) {
        if (legs.length <= 0) return null;

        let distance = 0, time = 0;
        legs.map((item) => {
            distance = Number(item.distance);
            time = Number(item.duration);
        });

        return ({ distance, time });
    }


    // ---- JSX ---- //
    return (
        <main className="container my-3">
            <h1>Create Route</h1>

            <RoutesForm allCheckpoints={allCheckpoints} setAllCheckpoints={setAllCheckpoints} handleSubmit={handleSubmit} resetForm={resetForm} routeName={routeName} setRouteName={setRouteName} />

            {allRoutes && (
                <div className="alert alert-success my-3" role="alert">
                    <p><b>Total Distance</b>: {allRoutes.distanceInKm} km</p>
                    <p><b>Total Time</b>: {allRoutes.timeInHours} km</p>
                </div>
            )}
            {(allRoutes) && (
                <TruckRouteMap routeData={allRoutes} allPoints={allCheckpoints} allRoutes={allRoutes.routes} />
            )}
            <p></p>

        </main>
    )
}

export default CreateRouteBody