import mongoose from 'mongoose';

// Location schema for better validation
const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
}, { _id: false }); // Prevents creating an unnecessary _id for subdocuments

const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true },
  volume: { type: Number, required: true },
  fuelCapacity: { type: Number, required: true },
  realTimeLocation: { type: locationSchema, default: { lat: 0.0, long: 0.0 } }, // Location schema
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null }, // Driver reference if you have a Driver model
  currentRoute: { type: String, default: null }, // Route ID or name
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

export default mongoose.model('Vehicle', vehicleSchema);
