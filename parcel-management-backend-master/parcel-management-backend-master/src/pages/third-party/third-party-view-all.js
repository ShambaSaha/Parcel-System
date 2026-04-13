import { MongoClient } from 'mongodb';

async function viewUserOrders(req, res) {
    const { apiKey } = req.body; 

    if (!apiKey) {
        return res.status(400).json({ status: "error", message: "API key is required" });
    }

    // Connect to MongoDB
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('parcel-management-system');
        const api = database.collection('api-keys');
        const parcels = database.collection('third-party-parcels');

        // Validate the API key
        const validApiKey = await api.findOne({ apiKey });

        const userId = validApiKey.userId;

        if (!validApiKey) {
            return res.status(403).json({ status: "error", message: "Forbidden: Invalid API Key" });
        }

        // Fetch orders for the user
        const userOrders = await parcels.find({ userId: userId }).toArray();

        // Response
        if (userOrders.length === 0) {
            return res.json({ status: "success", message: "No orders found", data: [] });
        }

        res.json({ status: "success", message: "Orders retrieved successfully", data: userOrders });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "An error occurred while fetching orders" });
    } finally {
        await client.close(); // Ensure client closes
    }
}

export default viewUserOrders;