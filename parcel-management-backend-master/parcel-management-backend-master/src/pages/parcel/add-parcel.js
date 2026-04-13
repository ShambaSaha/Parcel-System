import { Double, MongoClient } from 'mongodb';

async function addNewParcel(req, res) {
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
    } = req.body;

    // Validate the required fields
    if (!name || !length || !breadth || !height || !weight || !srcPincode || !destPincode || !serviceType || !itemType) {
        const response = {
            status: "error",
            message: "Missing required fields in the request body",
            data: {
                name, length, breadth, height, weight,
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
        srcCity = undefined;
        srcState = undefined;
        destCity = undefined;
        destState = undefined;
    }

    // Connect to MongoDB
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {
        const database = client.db('parcel-management-system');
        const parcels = database.collection('parcels');

        // Construct the document to insert
        const query = {
            name,
            dimensions: {
                length: new Double(length),
                breadth: new Double(breadth),
                height: new Double(height),
            },
            weight: new Double(weight),
            sender: {
                pincode: srcPincode,
                city: srcCity,
                state: srcState,
                country: serviceType === 'International' ? srcCountry : undefined // Only include country for international
            },
            receiver: {
                pincode: destPincode,
                city: destCity,
                state: destState,
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

export default addNewParcel;
