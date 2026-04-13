import express from 'express';
import setTruckLocation from '../pages/set-truck-location.js';
import { restrictToLoggedinUserOnly } from '../middleware/auth.js'; // Ensure only logged-in users can access this route

const router = express.Router();

// Middleware for input validation (optional but recommended)
function validateTruckLocationInput(req, res, next) {
    const { vehicleId, latitude, longitude } = req.body;
    if (!vehicleId || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ error: 'Invalid input: vehicleId, latitude, and longitude are required and must be valid.' });
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: 'Latitude must be between -90 and 90, and longitude between -180 and 180.' });
    }
    next();
}

// Define route for setting truck location
router.post('/set-truck-location', restrictToLoggedinUserOnly, validateTruckLocationInput, setTruckLocation);

export default router;
