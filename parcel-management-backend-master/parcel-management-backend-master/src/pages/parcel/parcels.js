import { MongoClient } from "mongodb";

async function load(req, res) {
    if (req.method === "GET") {
        const uri = process.env.MONGODB_CONNECTION_URI;
        const client = new MongoClient(uri);

        try {
            const database = client.db("parcel-management-system");
            const parcels = database.collection("parcels");

            // Fetch all documents
            const data = await parcels.find({}).toArray();

            res.status(200).json({ status: "success", data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "error", message: "An error occurred" });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}

export default load;
