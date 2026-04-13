import { MongoClient, ObjectId } from 'mongodb';


async function setTruckRoute(req, res, next) {
    let { id, routeId } = req.body;

    if (!id || !routeId) {
        const response = {
            status: "error",
            message: "Missing required fields in body",
            data: { id, routeId }
        };
        return res.status(400).json(response)
    }

    id = new ObjectId(String(id).trim())
    routeId = String(routeId).trim()

    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('parcel-management-system');
        const vehiclesCollection = database.collection('vehicles');

        const updateResult = await vehiclesCollection.updateOne(
            { _id: id },
            { $set: { routeId: routeId } }
        );

        if (updateResult.modifiedCount === 0) {
            throw new Error("No document was updated");
        }

    } catch (error) {
        console.error(error)
        res.json({ status: "error", message: "An error occurred" })
    } finally {
        await client.close();
    }

    const response = {
        status: "success",
        message: "Truck route set",
        data: { id, routeId }
    };
    res.json(response)
}


export default setTruckRoute;