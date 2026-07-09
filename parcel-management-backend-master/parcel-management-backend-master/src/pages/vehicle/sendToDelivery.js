import { MongoClient, ObjectId } from "mongodb";

async function sendToDelivery(req, res) {
  const { vehicleId } = req.body;

  if (!vehicleId) {
    return res.status(400).json({
      status: "error",
      message: "vehicleId is required"
    });
  }

  const uri = process.env.MONGODB_CONNECTION_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("parcel-management-system");
    const vehicles = database.collection("vehicles");

    // 🚀 FIXED: Removed the updateMany that was resetting all other trucks!
    // We only want to update the status of this specific vehicle.
    const result = await vehicles.updateOne(
      { _id: new ObjectId(vehicleId) },
      { $set: { status: "ON_DELIVERY" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Vehicle sent to delivery"
    });

  } catch (error) {
    console.error("Error in sendToDelivery:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send vehicle to delivery"
    });
  } finally {
    await client.close();
  }
}

export default sendToDelivery;