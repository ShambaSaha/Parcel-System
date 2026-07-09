import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
}, { _id: false });

const vehicleSchema = new mongoose.Schema({
    vehicleId: { type: String, required: true, unique: true },
    vehicleNumber: { type: String, required: true },
    name: { type: String, required: true },
    volume: { type: Object, required: true },
    fuelCapacity: { type: Number, required: true },
    realTimeLocation: { type: locationSchema, default: { lat: 0.0, long: 0.0 } },
    currentRoute: { type: String, default: null },
    status: { type: String, default: 'Delivered' }, // ADDED
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);