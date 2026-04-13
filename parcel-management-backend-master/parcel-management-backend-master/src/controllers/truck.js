import Vehicle from "../models/vehicle.js";

// Controller: Update Truck Location
export const setTruckLocation = async (req, res) => {
  try {
    const { vehicleId, latitude, longitude } = req.body;

    // Validate Input
    if (!vehicleId || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields: vehicleId, latitude, or longitude." });
    }

    // Update or Insert Vehicle Location in Database
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { vehicleId }, // Find by vehicle ID
      {
        currentRoute: "In Transit", // Example route update
        realTimeLocation: { lat: latitude, lng: longitude },
        lastUpdated: new Date(), // Record current timestamp
      },
      { new: true, upsert: true } // Create a new document if it doesn't exist
    );

    // Respond with Success
    return res.status(200).json({
      message: "Truck location updated successfully.",
      vehicle: {
        vehicleId: updatedVehicle.vehicleId,
        location: updatedVehicle.realTimeLocation,
        lastUpdated: updatedVehicle.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error updating truck location:", error);
    return res.status(500).json({ error: "Failed to update truck location." });
  }
};

// Controller: Get Truck Analytics
export const getTruckAnalytics = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Validate Input
    if (!vehicleId) {
      return res.status(400).json({ error: "Vehicle ID is required." });
    }

    // Fetch Vehicle Data
    const vehicle = await Vehicle.findOne({ vehicleId });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    // Respond with Analytics
    return res.status(200).json({
      message: "Truck analytics fetched successfully.",
      vehicle: {
        vehicleId: vehicle.vehicleId,
        location: vehicle.realTimeLocation,
        fuelCapacity: vehicle.fuelCapacity,
        volume: vehicle.volume,
        assignedDriver: vehicle.assignedDriver,
        currentRoute: vehicle.currentRoute,
      },
    });
  } catch (error) {
    console.error("Error fetching truck analytics:", error);
    return res.status(500).json({ error: "Failed to fetch truck analytics." });
  }
};
