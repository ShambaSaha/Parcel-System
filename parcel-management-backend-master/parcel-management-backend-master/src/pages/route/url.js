import express from "express";
import { 
    setTruckLocation, 
    getTruckAnalytics 
} from "../controllers/truck.js"; 
import { restrictToLoggedinUserOnly } from '../middlewares/auth.js';

const router = express.Router();

// Route to set/update truck location
router.post("/set-location", restrictToLoggedinUserOnly, setTruckLocation);

// Route to get truck analytics
router.get("/analytics/:vehicleId",restrictToLoggedinUserOnly, getTruckAnalytics);

export default router;
