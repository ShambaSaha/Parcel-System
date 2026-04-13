import { MongoClient, ObjectId } from 'mongodb';

async function getOneRoute(req, res, next) {
    let { id } = req.body

    if (!id) {
        const response = { status: "error", message: "Missing required fields in body", data: { id } }
        return res.json(response)
    }

    id = new ObjectId(String(id).trim());

    // connext to mongodb database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {

        const database = client.db('parcel-management-system');
        const truckRoutesCollection = database.collection('truck-routes');

        // Fetch the document with matching id
        const data = await truckRoutesCollection.findOne({ _id: id });
        console.log(data)

        const response = { status: "success", data: data };
        res.json(response)
 
    } catch (error) {
        console.error(error)
        res.json({ status: "error", message: "An error occurred" })
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }

}

export default getOneRoute;