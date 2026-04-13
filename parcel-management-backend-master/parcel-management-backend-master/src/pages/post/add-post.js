import { Double, MongoClient } from 'mongodb'

async function addNewPostOffice(req, res, next) {

    // Get the name, length, breadth, height, weight from the request
    const { name, lat, long, pin } = req.body;

    if (!name || !lat || !long || !pin) {
        const response = { status: "error", message: "Missing required fields in body", data: { name, length, width, height, weight } }
        return res.json(response)
    }

    // connext to mongodb database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);


    try {
        const database = client.db('parcel-management-system');
        const parcels = database.collection('post-offices');

        // create the data 
        const query = {
            name: name,
            lat: new Double(lat),
            long: new Double(long),
            pin: pin,
            createdAd: new Date()
        }

        const result = await parcels.insertOne(query);

        // return the response
        const parcelId = result.insertedId;

        const responeData = { status: "success", message: "Post Office added", id: parcelId, data: { name, lat, long, pin } }

        res.json(responeData)

    } catch (error) {
        console.error(error)
        res.json({ status: "error", message: "An error occurred" })
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

export default addNewPostOffice