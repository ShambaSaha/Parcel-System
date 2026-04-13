import { MongoClient, ObjectId } from 'mongodb';

async function deleteParcel(req, res, next) {
    const {id} = req.body;

    if(!id){
        const response = { status: "error", message: "Missing required fields in body", data: {id} }
        return res.json(response)
    }
    
    
    // Connect to MongoDB database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {

        const database = client.db('parcel-management-system');
        const parcels = database.collection('parcels');

        //find the vehicle in the database

        const query = { "_id": new ObjectId(id) };


        // Remove the vehicle document with the specified ID
        const result = await parcels.deleteOne(query);

        // Check if a document was deleted
        if (result.deletedCount === 1) {
            res.json({ status: "success", message: "Parcel removed successfully" });
        } else {
            res.status(404).json({ status: "error", message: "Parcel not found" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "An error occurred" });
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

export default deleteParcel;