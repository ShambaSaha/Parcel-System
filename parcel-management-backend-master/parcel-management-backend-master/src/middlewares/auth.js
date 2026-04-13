import { setUser, getUser } from '../service/auth.js';

/**
 * Middleware to restrict access to logged-in users only.
 * Redirects to login if no valid session exists.
 */
export async function restrictToLoggedinUserOnly(req, res, next) {
    try {
        const userUid = req.cookies?.uid;

        if (!userUid) {
            return res.redirect('/login'); // Redirect if session ID not found
        }

        const user = getUser(userUid); // Fetch user details using session ID

        if (!user) {
            return res.redirect('/login'); // Redirect if session is invalid or expired
        }

        req.user = user; // Attach user to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error in restrictToLoggedinUserOnly middleware:', error);
        return res.status(500).json({ error: 'Failed to verify session.' });
    }
}

/**
 * Middleware for optional authentication.
 * Attaches user details to the request object if logged in; otherwise, sets it to null.
 */
export async function checkAuth(req, res, next) {
    try {
        const userUid = req.cookies?.uid;

        if (userUid) {
            const user = getUser(userUid); // Fetch user details if session exists
            req.user = user; // Attach user to the request object
        } else {
            req.user = null; // No session; set user to null
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error in checkAuth middleware:', error);
        return res.status(500).json({ error: 'Failed to verify authentication.' });
    }
}
