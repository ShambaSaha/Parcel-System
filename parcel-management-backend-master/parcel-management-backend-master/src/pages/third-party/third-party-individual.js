import { MongoClient, ObjectId } from 'mongodb';

async function viewIndividualUserOrders(req, res) {
    const { apiKey, orderId } = req.body; // Accepting orderId in the request body

    if (!apiKey) {
        return res.status(400).json({ status: "error", message: "API key is required" });
    }
    if(!orderId){
        return res.status(400).json({ status: "error", message: "Order Id is required" });
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

        if (!validApiKey) {
            return res.status(403).json({ status: "error", message: "Forbidden: Invalid API Key" });
        }

        const userId = validApiKey.userId;

        // Fetch orders for the user
        const userOrders = await parcels.find({ userId: userId }).toArray();

        // If no specific orderId is provided, return all orders
        if (!orderId) {
            if (userOrders.length === 0) {
                return res.json({ status: "success", message: "No orders found", data: [] });
            }

            return res.json({ status: "success", message: "Orders retrieved successfully", data: userOrders });
        }

        // Find the specific order by orderId
        const order = userOrders.find(order => order._id.toString() === orderId);

        if (!order) {
            return res.status(404).json({ status: "error", message: "Order not found" });
        }

        res.json({ status: "success", message: "Order retrieved successfully", data: order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "An error occurred while fetching orders" });
    } finally {
        await client.close(); // Ensure client closes
    }
}

export default viewIndividualUserOrders;