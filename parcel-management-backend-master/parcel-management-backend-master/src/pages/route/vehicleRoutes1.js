import express from 'express';
import { addVehicle } from '../controllers/vehicleController.js';
import { restrictToLoggedinUserOnly } from '../middlewares/auth.js';

const router = express.Router();

// Protect the /add endpoint
router.post('/add', restrictToLoggedinUserOnly, addVehicle);

export default router;
