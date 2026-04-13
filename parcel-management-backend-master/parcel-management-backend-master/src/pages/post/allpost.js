import { MongoClient, ObjectId } from 'mongodb';

async function getAllPost(req, res, next) {

    // connext to mongodb database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {

        const database = client.db('parcel-management-system');
        const post = database.collection('post-offices');

        // Fetch all documents
        const data = await post.find({}).toArray();
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

export default getAllPost