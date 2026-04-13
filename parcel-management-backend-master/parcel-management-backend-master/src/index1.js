import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import locationRoutes from './routes/locationRoutes.js'; // Location-related APIs
import vehicleRoutes from './routes/vehicleRoutes.js'; // Vehicle management APIs
import userRoute from './routes/user.js'; // User authentication routes
import staticRoute from './routes/staticRouter.js'; // Static routes for the homepage
import { restrictToLoggedinUserOnly, checkAuth } from './middlewares/auth.js';

const app = express();
const port = process.env.PORT || 4000;

const path = require("path");
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// MongoDB URI from .env
const mongoURI = process.env.MONGODB_CONNECTION_URI;

if (!mongoURI) {
    console.error("Error: MONGODB_CONNECTION_URI not set in .env");
    process.exit(1);
}

// Middleware setup
app.use(cors()); // Enable CORS for cross-origin resource sharing
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.resolve("./views")); // Set views directory

app.use(express.json()); // Middleware for parsing JSON request bodies
app.use(cookieParser()); // Middleware for parsing cookies

// Telematics-related routes
app.use('/api/vehicles', restrictToLoggedinUserOnly, vehicleRoutes); // Routes for vehicle management
app.use('/api/locations', restrictToLoggedinUserOnly, locationRoutes); // Routes for location tracking

// User authentication routes
app.use('/user', userRoute);

// Static routes with optional authentication
app.use("/", checkAuth, staticRoute);

// MongoDB connection
mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process on MongoDB connection error
    });

// Default Route (optional)
app.get('/', (req, res) => {
    res.send('Welcome to the Road Transport Network Telematics API!');
});

// Start server
app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
