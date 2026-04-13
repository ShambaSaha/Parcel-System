import express from 'express';
import setTruckLocation from '../pages/vehicle/set-truck-location.js';

const router = express.Router();

// Define route for setting truck location
router.post('/set-truck-location', setTruckLocation);

export default router;
