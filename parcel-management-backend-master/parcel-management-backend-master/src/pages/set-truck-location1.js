import Vehicle from '../models/vehicle.js'; // Import the Mongoose model for the vehicle
import moment from 'moment'; // For formatting timestamps

// Function to Set Truck Location
async function setTruckLocation(req, res) {
    try {
        const { vehicleId, latitude, longitude } = req.body;

        // Validate Input
        if (!vehicleId || typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({ 
                error: 'Missing or invalid fields: vehicleId, latitude, or longitude must be provided and valid.' 
            });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ 
                error: 'Latitude must be between -90 and 90, and longitude must be between -180 and 180.' 
            });
        }

        // Update Vehicle Location in Database
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { vehicleId }, // Find by vehicle ID
            {
                realTimeLocation: { lat: latitude, long: longitude },
                lastUpdated: moment().toISOString(),
            },
            { new: true, upsert: true } // Create a new document if it doesn't exist
        );

        // Respond with Success
        res.status(200).json({
            message: 'Truck location updated successfully.',
            vehicle: {
                vehicleId: updatedVehicle.vehicleId,
                realTimeLocation: updatedVehicle.realTimeLocation,
                timestamp: updatedVehicle.lastUpdated || updatedVehicle.updatedAt, // Use `updatedAt` if lastUpdated is not in schema
            },
        });
    } catch (error) {
        console.error('Error setting truck location:', error);
        res.status(500).json({ error: 'Failed to update truck location.' });
    }
}

export default setTruckLocation;
