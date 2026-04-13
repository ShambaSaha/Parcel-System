import express from "express";
import { handleUserSignup, handleUserLogin } from "../controllers/user.js";

const router = express.Router();

// Route to handle user signup
router.post("/signup", handleUserSignup);

// Route to handle user login
router.post("/login", handleUserLogin);

export default router;
