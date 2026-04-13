import { MongoClient } from 'mongodb';

export default async function statistics(req, res) {

  const uri = process.env.MONGODB_CONNECTION_URI;
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();

    // Access the 'parcel-management-system' database
    const database = client.db('parcel-management-system');

    // Fetch statistics for parcels, trucks, post offices, and parcel statuses
    const parcelsCount = await database.collection('parcels').countDocuments();
    const trucksCount = await database.collection('vehicles').countDocuments();
    const postOfficesCount = await database.collection('post-offices').countDocuments();
    const statusCount = await database.collection('parcel-status').countDocuments();
    const truckstatus = await database.collection('truck-updates').countDocuments();

    // Prepare the response object
    const response = {
      status: 'success',
      data: {
        parcelsCount,
        trucksCount,
        postOfficesCount,
        statusCount,
        truckstatus,
      },
    };

    // Send the response back to the client
    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred' });
  } finally {
    // Ensure that the client is closed after operation
    await client.close();
  }
}
