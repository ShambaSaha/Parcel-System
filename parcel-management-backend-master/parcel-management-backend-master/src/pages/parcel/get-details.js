import { MongoClient, ObjectId } from 'mongodb';

async function getParcelDetails(req, res, next) {
    // Get the truck ID  from the request
    const { id } = req.body



    
    if (!id) {
        const response = { status: "error", message: "Missing required fields in body", data: { id } }
        return res.json(response)
    }

    // connext to mongodb database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {

        const database = client.db('parcel-management-system');
        const parcels = database.collection('parcels');


        // find the parcel in the database
        const query = { "_id": new ObjectId(id) };

        const result = await parcels.findOne(query);

        console.log(result)

        if (result) {
            const response = { status: "success", message: "Parcel found", data: result }
            return res.json(response)
        } else {
            const response = { status: "error", message: "Parcel not found", data: { id } }
            return res.json(response)
        }

    } catch (error) {
        console.error(error)
        res.json({ status: "error", message: "An error occurred" })
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

export default getParcelDetails