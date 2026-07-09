import { MongoClient, ObjectId } from 'mongodb';

import Vehicle from '../../models/vehicle'; // Ensure this path is correct

export default async function markDelivered(req, res) {
    try {
        const { vehicleId } = req.body;
        
        // Use findByIdAndUpdate - this is the most reliable way to update
        const updated = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { $set: { status: "DELIVERED" } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ status: "error", message: "Vehicle not found" });
        }

        res.status(200).json({ status: "success", data: updated });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

    