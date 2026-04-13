import { MongoClient } from 'mongodb';

async function fetchParcelsByPincodes(req, res, next) {
    // Get sender and receiver pincodes from the request body
    let { senderPincode, receiverPincode } = req.body;

    // Validate and convert pincodes to strings
    senderPincode = senderPincode ? String(senderPincode).trim() : null;
    receiverPincode = receiverPincode ? String(receiverPincode).trim() : null;

    // Comprehensive input validation
    const errors = [];

    // Pincode validation regex (optional but recommended)
    const pincodeRegex = /^\d{6}$/;

    if (!senderPincode) {
        errors.push('Sender pincode is required');
    } else if (!pincodeRegex.test(senderPincode)) {
        errors.push('Sender pincode must be a 6-digit number');
    }

    if (!receiverPincode) {
        errors.push('Receiver pincode is required');
    } else if (!pincodeRegex.test(receiverPincode)) {
        errors.push('Receiver pincode must be a 6-digit number');
    }

    // Return validation errors if any
    if (errors.length > 0) {
        return res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: errors
        });
    }

    console.log(`Sender Pincode: ${senderPincode}, Receiver Pincode: ${receiverPincode}`);

    // Connect to MongoDB database
    const uri = process.env.MONGODB_CONNECTION_URI;
    const client = new MongoClient(uri);

    try {
        // Establish database connection
        await client.connect();
        const database = client.db('parcel-management-system');
        const parcelsCollection = database.collection('parcels');

        // Construct query to match sender and receiver pincodes
        const query = {
            'sender.pincode': senderPincode,
            'receiver.pincode': receiverPincode
        };

        // Find matching parcels with additional options
        const results = await parcelsCollection
            .find(query)
            .sort({ createdAt: -1 }) // Sort by most recent first
            .toArray();

        // Log number of results found
        console.log(`Found ${results.length} matching parcels`);

        // Handle no results scenario
        if (results.length === 0) {
            return res.json({
                status: "success",
                message: "No parcels found for the provided pincodes",
                data: [],
                senderPincode,
                receiverPincode
            });
        }

        // Prepare response with additional metadata
        const responseData = {
            status: "success",
            message: "Parcels retrieved successfully",
            count: results.length,
            senderPincode,
            receiverPincode,
            data: results
        };

        res.json(responseData);

    } catch (error) {
        // Detailed error logging
        console.error('Error fetching parcels:', error);
        
        // Send error response
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching parcels",
            errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        // Ensure database connection is closed
        await client.close();
    }
}

export default fetchParcelsByPincodes;