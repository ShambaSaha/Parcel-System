import { Double, MongoClient } from 'mongodb';

async function addNewParcelThird(req, res) {
    
    const {apiKey, parcelData} = req.body;
    if(!apiKey || !parcelData){
        const response = { status: "error", message: "Missing required fields in body", data: {apiKey, parcelData} }
        return res.json(response)
    }

    const {
        name,
        length,
        breadth,
        height,
        weight,
        srcPincode,
        srcCity,
        srcState,
        destPincode,
        destCity,
        destState,
        srcCountry,  // added country fields for international
        destCountry, // added country fields for international
        serviceType, // domestic or international
        itemType // type of item
    } = parcelData;

    // Connect to MongoDB
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    const database = client.db('parcel-management-system');
    const api = database.collection('api-keys');
    const parcels = database.collection('third-party-parcels');


    
    // Validate the API key
    const validApiKey = await api.findOne({ apiKey });

    // Get the userId from validApiKey
    const userId = validApiKey.userId;

    if(!validApiKey) {
        return res.status(403).json({ status: "error", message: "Forbidden: Invalid API Key" });
    }


    // Validate the required fields
    if (!name || !length || !breadth || !height || !weight || !srcPincode || !destPincode || !serviceType || !itemType) {
        const response = {
            status: "error",
            message: "Missing required fields in the request body",
            data: {
                userId, name, length, breadth, height, weight,
                srcPincode, srcCity, srcState,
                destPincode, destCity, destState,
                serviceType, itemType
            }
        };
        return res.json(response);
    }

    // If service type is international, ensure that only country details are required for sender and receiver
    
    if (serviceType === 'International') {
        if (!srcCountry || !destCountry) {
            const response = {
                status: "error",
                message: "Missing required country fields for international parcels",
                data: { srcCountry, destCountry }
            };
            return res.json(response);
        }

        // Remove city and state data for international parcels

        // srcCity = undefined;
        // srcState = undefined;
        // destCity = undefined;
        // destState = undefined;
    }


    try {

        // Construct the document to insert
        const query = {
            userId,
            name,
            dimensions: {
                length: new Double(length),
                breadth: new Double(breadth),
                height: new Double(height),
            },
            weight: new Double(weight),
            sender: {
                pincode: srcPincode,
                city: serviceType !== 'International' ? srcCity : undefined,
                state: serviceType !== 'International' ? srcState : undefined,
                country: serviceType === 'International' ? srcCountry : undefined // Only include country for international
            },
            receiver: {
                pincode: destPincode,
                city: serviceType !== 'International' ? destCity : undefined,
                state: serviceType !== 'International' ? destState : undefined,
                country: serviceType === 'International' ? destCountry : undefined // Only include country for international
            },
            serviceType,
            itemType,
            createdAt: new Date()
        };

        // Insert the parcel into the database
        const result = await parcels.insertOne(query);

        // Response
        const parcelId = result.insertedId;
        const responseData = {
            status: "success",
            message: "Parcel added successfully",
            id: parcelId,
            data: query
        };

        res.json(responseData);

    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "An error occurred while adding the parcel" });
    } finally {
        await client.close(); // Ensure client closes
    }
}

export default addNewParcelThird;
