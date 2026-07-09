import { MongoClient } from 'mongodb';

// 1. CONNECTION POOLING: Define cached variables outside the function scope.
// This prevents the server from opening a new DB connection on every single request.
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);
    
    await client.connect();
    const db = client.db('parcel-management-system');
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
}

async function createTruckRoute(req, res) {
    // Get the truck route details from the request body
    let { routeName, startLocation, endLocation, waypoints, distance, estimatedTime, status } = req.body;

    // Validate required fields
    if (!routeName || !startLocation || !endLocation || distance === undefined || estimatedTime === undefined) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields in body",
            data: { routeName, startLocation, endLocation, waypoints, distance, estimatedTime, status }
        });
    }

    // Validate Minimum Waypoints (Mirroring Frontend Logic)
    if (!waypoints || waypoints.length < 3) {
        return res.status(400).json({
            status: "error",
            message: "A truck route must contain at least 3 valid checkpoints.",
        });
    }

    try {
        // Trim and ensure proper data types
        startLocation = {
            name: String(startLocation.name).trim(),
            lat: Number(startLocation.lat),
            long: Number(startLocation.long),
            type: String(startLocation.type).trim()
        };
        
        endLocation = {
            name: String(endLocation.name).trim(),
            lat: Number(endLocation.lat),
            long: Number(endLocation.long),
            type: String(endLocation.type).trim()
        };

        waypoints = waypoints.map(waypoint => ({
            name: String(waypoint.name).trim(),
            lat: Number(waypoint.lat),
            long: Number(waypoint.long),
            type: String(waypoint.type).trim()
        }));

        routeName = String(routeName).trim();
        status = status ? String(status).trim() : "active";
        
        // 2. Store distance and time as Numbers for easier DB sorting/querying later
        distance = Number(distance);
        estimatedTime = Number(estimatedTime);

        // Connect to MongoDB database using the caching function
        const { db } = await connectToDatabase();
        const routesCollection = db.collection('truck-routes');

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
        res.status(201).json({
            status: "success",
            message: "Truck route added successfully",
            id: result.insertedId,
            data: truckRouteData
        });

    } catch (error) {
        console.error("Backend Error in createTruckRoute:", error);
        res.status(500).json({ 
            status: "error", 
            message: "An error occurred while adding the truck route" 
        });
    }
    // Notice: We no longer have a `finally { client.close() }` block.
    // We want to keep the connection open for the next request to use!
}

export default createTruckRoute;