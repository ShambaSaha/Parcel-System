import { MongoClient } from 'mongodb';

async function createTruckRoute(req, res, next) {
    // Get the truck route details from the request body
    let { routeName, startLocation, endLocation, waypoints, distance, estimatedTime, status } = req.body;

    // Validate required fields
    if (!routeName || !startLocation || !endLocation || !distance || !estimatedTime) {
        const response = {
            status: "error",
            message: "Missing required fields in body",
            data: { routeName, startLocation, endLocation, waypoints, distance, estimatedTime, status }
        };
        return res.status(400).json(response); // Return 400 Bad Request
    }

    // Trim and ensure proper data types
    startLocation = {
        name: String(startLocation.name).trim(),
        // address: String(startLocation.address).trim(),
        lat: Number(startLocation.lat),
        long: Number(startLocation.long),
        type: String(startLocation.type).trim()
    };
    
    endLocation = {
        name: String(endLocation.name).trim(),
        // address: String(endLocation.address).trim(),
        lat: Number(endLocation.lat),
        long: Number(endLocation.long),
        type: String(endLocation.type).trim()
    };

    waypoints = waypoints.map(waypoint => ({
        name: String(waypoint.name).trim(),
        // address: String(waypoint.address).trim(),
        lat: Number(waypoint.lat),
        long: Number(waypoint.long),
        type: String(waypoint.type).trim()
    }));

    routeName = String(routeName).trim();
    distance = String(distance).trim();
    estimatedTime = String(estimatedTime).trim();
    status = status ? String(status).trim() : "active"; // Default to "active" if not provided

    // Connect to MongoDB database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect(); // Ensure connection is established
        const database = client.db('parcel-management-system');
        const routesCollection = database.collection('truck-routes');

        // Create the truck route data object
        const truckRouteData = {
            routeName,
            startLocation,
            endLocation,
            waypoints,
            distance,
            estimatedTime,
            status,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert the truck route into the collection
        const result = await routesCollection.insertOne(truckRouteData);

        // Return the response
        const routeIdInserted = result.insertedId;
        const responseData = {
            status: "success",
            message: "Truck route added",
            id: routeIdInserted,
            data: truckRouteData
        };

        res.status(201).json(responseData); // Return 201 Created

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "An error occurred while adding the truck route" }); // Return 500 Internal Server Error
    } finally {
        // Ensure that the client will close when you finish/error
        await client.close();
    }
}

export default createTruckRoute;