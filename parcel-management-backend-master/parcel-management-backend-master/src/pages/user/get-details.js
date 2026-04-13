import { MongoClient, ObjectId } from 'mongodb';

async function getAllUser(req, res, next) {

    // connext to mongodb database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {

        const database = client.db('parcel-management-system');
        const users = database.collection('users');

        // Fetch all documents
        const data = await users.find({}).toArray();
        // console.log(data)

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

export default getAllUser