import { MongoClient } from 'mongodb';

async function fetchPostOffice(req, res, next) {
    // Get the parcelStatusId from the request body
    let { Pincode } = req.body;

    Pincode = Number(Pincode); // type change to number

    // Validate the input
    if (!Pincode) {
        const response = {
            status: "error",
            message: "Missing required fields in body",
            data: { Pincode }
        };
        return res.json(response);
    }
    console.log(`Pincode: ${Pincode}`)

    // Connect to MongoDB database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect(); // Ensure connection is established
        const database = client.db('parcel-management-system');
        const indian_post_offices = database.collection('indian-post-offices');

        // Query for all entries with the specified parcelStatusId
        const query = { 'Pincode': Pincode };
        const results = await indian_post_offices.find(query).toArray(); // Get all matching documents

        console.log(results);
        // Check if results were found
        if (results.length === 0) {
            return res.json({
                status: "success",
                message: "No entries found for the provided pincode",
                data: []
            });
        }

        // Return the results
        const responseData = {
            status: "success",
            message: "Entries retrieved successfully",
            data: results
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

export default fetchPostOffice;