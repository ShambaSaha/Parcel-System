import { MongoClient } from 'mongodb';

async function getContractorsByPincode(req, res) {
    const { pincode } = req.body;
    if (!pincode) {
        return res.status(400).json({
            status: 'error',
            message: 'Pincode is required',
        });
    }

    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);
    
    try {
        const database = client.db('parcel-management-system');
        const contractorCollection = database.collection('contractor');

        // Find contractors assigned to the given pincode
        const contractors = await contractorCollection.find({ pincode: pincode }).toArray();
        res.status(200).json({
            status: 'success',
            data: contractors,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching contractors',
        });
    } finally {
        await client.close();
    }
}

export default getContractorsByPincode;
