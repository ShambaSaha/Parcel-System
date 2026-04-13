// A Map to store sessionId -> user mappings in memory
const sessionIdToUserMap = new Map();

/**
 * Stores a user in the session map with a session ID.
 * @param {string} id - The unique session ID.
 * @param {object} user - The user object to associate with the session ID.
 */
export function setUser(id, user) {
    if (!id || !user) {
        console.error('Invalid setUser call: Missing session ID or user object');
        throw new Error('Both session ID and user object are required');
    }
    sessionIdToUserMap.set(id, user); // Store user in the session map
    console.log(`User session set: ${id}`);
}

/**
 * Retrieves a user from the session map using the session ID.
 * @param {string} id - The session ID.
 * @returns {object | undefined} - The user object associated with the session ID or undefined if not found.
 */
export function getUser(id) {
    if (!id) {
        console.error('Invalid getUser call: Missing session ID');
        throw new Error('Session ID is required to fetch user');
    }
    return sessionIdToUserMap.get(id); // Retrieve user from the session map
}
