import { Double, MongoClient } from 'mongodb'

async function setTruckLocation(req, res, next) {
    // Get the truck ID and location from the request
    const { id, lat, long } = req.body

    if (!id || !lat || !long) {
        const response = { status: "error", message: "Missing required fields in body", data: { id, lat, long } }
        return res.json(response)
    }

    // connext to mongodb database
    const uri = process.env.MONGODB_CONNECTION_URI;
    console.log(uri)
    const client = new MongoClient(uri);

    try {
        const database = client.db('parcel-management-system');
        const parcels = database.collection('truck-updates');
        // timestamp

        // get the current time in BSON UTC datetime format
        const timestamp = new Date();

        const query = {
            "truckId": id,
            "lat": new Double(lat),
            "long": new Double(long),
            "timestamp": timestamp
        };

        // add the truck location to the database
        const result = await parcels.insertOne(query);

        console.log(result)
        console.log(`A document was inserted with the _id: ${result.insertedId}`);



    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }

    const response = { status: "success", message: "Truck location set", data: { id, lat, long } }
    res.json(response)
}

export default setTruckLocation