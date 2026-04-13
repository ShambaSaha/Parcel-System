import { MongoClient } from 'mongodb';

async function fetchParcelStatus(req, res, next) {
    // Get the parcelStatusId from the request body
    const { parcelStatusId } = req.body;

    // Validate the input
    if (!parcelStatusId) {
        const response = { 
            status: "error", 
            message: "Missing required fields in body", 
            data: { parcelStatusId } 
        };
        return res.json(response);
    }

    // Connect to MongoDB database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect(); // Ensure connection is established
        const database = client.db('parcel-management-system');
        const parcel_status = database.collection('parcel-status');

        // Query for all entries with the specified parcelStatusId
        const query = { parcelStatusId: parcelStatusId };
        const results = await parcel_status.find(query).toArray(); // Get all matching documents

        // Check if results were found
        if (results.length === 0) {
            return res.json({ 
                status: "success", 
                message: "No entries found for the provided parcelStatusId", 
                data: [] 
            });
        }

        // Return the results
        const responseData = { 
            status: "success", 
            message: "Entries retrieved successfully", 
            data: results 
        };

        res.json(responseData);

    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "An error occurred" });
    } finally {
        // Ensure that the client will close when you finish/error
        await client.close();
    }
}

export default fetchParcelStatus;