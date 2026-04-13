import { MongoClient } from 'mongodb';

async function parcelStatus(req, res, next) {
    // Get the parcelStatusId and parcelStatus from the request body
    const { parcelStatusId, parcelStatus } = req.body;

    // Validate the input
    if (!parcelStatusId || !parcelStatus) {
        const response = { 
            status: "error", 
            message: "Missing required fields in body", 
            data: { parcelStatusId, parcelStatus } 
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

        // Create the data object to insert
        const parcelTime = new Date(); // Get the current time
        const query = {
            parcelStatusId: parcelStatusId,
            parcelStatus: parcelStatus,
            parcelTime: parcelTime // Include parcelTime in the document
        };

        const result = await parcel_status.insertOne(query);

        // Return the response
        const responseData = { 
            status: "success", 
            message: "Parcel status added", 
            id: result.insertedId, // Use the insertedId from the result
            data: { parcelStatusId, parcelStatus, parcelTime } 
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

export default parcelStatus;