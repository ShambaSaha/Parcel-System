import { MongoClient } from 'mongodb'
import { calculateVolume } from '../../lib/volumeCalculator.js';

async function addNewVehicle(req, res) {
  let { name, number, length, breadth, height, weight, fuelCapacity } = req.body;

  if (!name || !number || !length || !breadth || !height || !weight || !fuelCapacity) {
    return res.json({
      status: "error",
      message: "Missing required fields",
      data: { name, number, length, breadth, height, weight, fuelCapacity }
    });
  }

  name = String(name).trim();
  number = String(number).trim();
  length = Number(length);
  breadth = Number(breadth);
  height = Number(height);
  weight = Number(weight);
  fuelCapacity = Number(fuelCapacity);

  const volumeObject = {
    length,
    breadth,
    height,
    total: calculateVolume(length, breadth, height)
  };

  const uri = process.env.MONGODB_CONNECTION_URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db('parcel-management-system');
    const vehicles = database.collection('vehicles');

    const vehicleDoc = {
      name,
      number,
      volume: volumeObject,
      remainingVolume: volumeObject,
      weight,
      remainingWeight: weight,
      fuelCapacity,
      routeId: "",
      status: "IDLE", // ✅ NEW FIELD
      createdAt: new Date()
    };

    const result = await vehicles.insertOne(vehicleDoc);

    res.json({
      status: "success",
      message: "Vehicle added",
      id: result.insertedId,
      data: vehicleDoc
    });

  } catch (error) {
    console.error(error);
    res.json({ status: "error", message: "An error occurred" });
  } finally {
    await client.close();
  }
}

export default addNewVehicle;