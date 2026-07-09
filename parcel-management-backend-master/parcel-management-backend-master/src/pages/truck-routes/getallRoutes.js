import { MongoClient } from 'mongodb';

// Reusing the connection pooling logic to keep your database fast!
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);
    
    await client.connect();
    // Matches the database name in your screenshot exactly
    const db = client.db('parcel-management-system'); 
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
}

// Controller function to fetch all routes
async function getallRoutes(req, res) {
    try {
        const { db } = await connectToDatabase();
        // Matches the collection name in your screenshot exactly
        const routesCollection = db.collection('truck-routes');

        // Fetch all documents in the collection
        // Optional: You can sort them by newest first by adding .sort({ createdAt: -1 })
        const allRoutes = await routesCollection.find({}).sort({ createdAt: -1 }).toArray();

        // Send the JSON response exactly as the frontend expects it
        res.status(200).json({
            status: "success",
            data: allRoutes
        });

    } catch (error) {
        console.error("Backend Error in getAllRoutes:", error);
        res.status(500).json({ 
            status: "error", 
            message: "An error occurred while fetching the truck routes" 
        });
    }
}

export default getallRoutes;