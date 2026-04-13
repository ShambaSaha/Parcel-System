import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { setUser } from "../service/auth.js";

// Handle user signup
export async function handleUserSignup(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate inputs
        if (!name || !email || !password) {
            return res.status(400).send("All fields are required.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        await User.create({ name, email, password: hashedPassword });

        return res.redirect("/login");
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).send("An error occurred during signup.");
    }
}

// Handle user login
export async function handleUserLogin(req, res) {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).send("Email and password are required.");
        }

        // Find user in database
        const user = await User.findOne({ email });

        // Check if user exists and passwords match
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render("login", {
                error: "Invalid email or password",
            });
        }

        // Generate session ID and set session
        const sessionId = uuidv4();
        setUser(sessionId, user);
        res.cookie("uid", sessionId, { httpOnly: true, secure: true });

        return res.redirect("/");
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("An error occurred during login.");
    }
}
