import { MongoClient, ObjectId } from "mongodb";

async function sendToDelivery(req, res) {
  const { vehicleId } = req.body;

  if (!vehicleId) {
    return res.json({
      status: "error",
      message: "vehicleId is required"
    });
  }

  const uri = process.env.MONGODB_CONNECTION_URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db("parcel-management-system");
    const vehicles = database.collection("vehicles");

    // 1️⃣ Set all vehicles to IDLE
    await vehicles.updateMany(
      {},
      { $set: { status: "IDLE" } }
    );

    // 2️⃣ Set selected vehicle to ON_DELIVERY
    const result = await vehicles.updateOne(
      { _id: new ObjectId(vehicleId) },
      { $set: { status: "ON_DELIVERY" } }
    );

    if (result.matchedCount === 0) {
      return res.json({
        status: "error",
        message: "Vehicle not found"
      });
    }

    res.json({
      status: "success",
      message: "Vehicle sent to delivery"
    });

  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      message: "Failed to send vehicle to delivery"
    });
  } finally {
    await client.close();
  }
}

export default sendToDelivery;
