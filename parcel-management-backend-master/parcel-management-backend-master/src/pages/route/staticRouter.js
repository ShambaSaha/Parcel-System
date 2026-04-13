import express from "express";
import { restrictToLoggedinUserOnly, checkAuth } from "../middlewares/auth.js";

const router = express.Router();

// Home Route - Requires User to Be Logged In
router.get("/", restrictToLoggedinUserOnly, (req, res) => {
    res.render("home", { user: req.user }); // Pass logged-in user data to home.ejs
});

// Signup Page - Accessible to Everyone but Redirects Logged-In Users
router.get("/signup", checkAuth, (req, res) => {
    if (req.user) return res.redirect("/"); // Redirect if logged in
    return res.render("signup");
});

// Login Page - Accessible to Everyone but Redirects Logged-In Users
router.get("/login", checkAuth, (req, res) => {
    if (req.user) return res.redirect("/"); // Redirect if logged in
    return res.render("login");
});

export default router;
