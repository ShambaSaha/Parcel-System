import express from 'express';
import { addVehicle } from '../controllers/vehicleController.js';

const router = express.Router();

// POST route for adding a vehicle
router.post('/add', addVehicle);

export default router;