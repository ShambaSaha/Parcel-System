import Vehicle from '../models/vehicle.js';

// Add a new vehicle
export const addVehicle = async (req, res) => {
  try {
    const { vehicleId, vehicleNumber, volume, fuelCapacity, realTimeLocation, assignedDriver, currentRoute } = req.body;

    // Validate required fields
    if (!vehicleId || !vehicleNumber || !volume || !fuelCapacity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if vehicle already exists in the database
    const existingVehicle = await Vehicle.findOne({ vehicleId });
    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle already exists with this ID' });
    }

    // Create a new vehicle document
    const newVehicle = new Vehicle({
      vehicleId,
      vehicleNumber,
      volume,
      fuelCapacity,
      realTimeLocation: realTimeLocation || null, // Optional GPS location
      assignedDriver: assignedDriver || null, // Optional driver assignment
      currentRoute: currentRoute || null, // Optional route assignment
    });

    // Save the vehicle to the database
    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ message: 'Error adding vehicle', error: error.message });
  }
};