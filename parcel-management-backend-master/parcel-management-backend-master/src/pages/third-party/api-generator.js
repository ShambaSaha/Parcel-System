import crypto from 'crypto';
import { webcrypto } from 'crypto';
import { Double, MongoClient } from 'mongodb';


async function generateApiKey(req, res, next) {

    const { userId } = req.body; // Assuming userId is sent in the request body
    if (!userId) {
        const response = { status: "error", message: "Missing required fields in body", data: { userId } }
        return res.json(response)
    }

    // Connect to MongoDB
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {
        const data = crypto.randomUUID()

        const database = client.db('parcel-management-system');
        const apiKey = database.collection('api-keys');

        const query = {
            userId: userId,
            apiKey: data,
            createdAt: new Date()
        };

        // Insert the userId and api key into the database
        const result = await apiKey.insertOne(query);

        const response = { status: "success", apiKey: data };
        res.json(response)
    }
    catch (error) {
        console.error(error);
        res.json({ status: "error", message: "An error occurred" })
    }
}

export default generateApiKey