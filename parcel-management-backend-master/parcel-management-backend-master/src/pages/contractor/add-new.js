import { Double, MongoClient } from 'mongodb'

async function addNewContractor(req, res, next) {

    let { name, number, pincode } = req.body;

    if (!name || !number || !pincode) {
        const response = { status: "error", message: "Missing required fields in body", data: { name, number, pincode } }
        return res.json(response)
    }

    name = String(name).trim()
    number = String(number).trim()
    pincode=String(pincode).trim()

    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);


    try {
        const database = client.db('parcel-management-system');
        const contractor = database.collection('contractor');

        const query = {
            name: name,
            number: number,
            pincode: pincode
        }

        const result = await contractor.insertOne(query);

        const contractorId = result.insertedId;

        const responeData = { status: "success", message: "Contractor added", id: contractorId, data: { ...query } }

        res.json(responeData)

    } catch (error) {
        console.error(error)
        res.json({ status: "error", message: "An error occurred" })
    } finally {

        await client.close();
    }
}

export default addNewContractor