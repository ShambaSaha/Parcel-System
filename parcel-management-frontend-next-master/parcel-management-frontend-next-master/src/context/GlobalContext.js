import { createContext, useContext, useReducer, useState, useEffect } from "react";

const GlobalConext = createContext(null);

// 🛠️ Helper function to decode JWT tokens without external libraries
const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const GlobalConextProvider = ({ children }) => {
  const [state, dispatch] = useReducer((s) => s, {});
  const [token, setToken] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [role, setRole] = useState(null);

  let isLoggedIn = !!token;

  // 1️⃣ When storing a token (Registration / Login)
  const storeTokenInLS = (serverToken) => {
    setToken(serverToken);
    
    // Decode and set the role instantly
    const decoded = decodeToken(serverToken);
    if (decoded && decoded.role) {
      setRole(decoded.role);
    }
    
    return localStorage.setItem("token", serverToken);
  };

  // 2️⃣ When the app initially loads (Hydration check)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      
      // Decode the existing token to restore the user's role
      const decoded = decodeToken(storedToken);
      if (decoded && decoded.role) {
        setRole(decoded.role);
      }
    }
    setIsHydrated(true);
  }, []);

  // 3️⃣ When logging out
  const LogoutUser = () => {
    setToken("");
    setRole(null); // Clear the role state
    return localStorage.removeItem("token");
  };

  if (!isHydrated) {
    return null; // or a loader
  }

  return (
    <GlobalConext.Provider value={{ isLoggedIn, storeTokenInLS, role, LogoutUser }}>
      {children}
    </GlobalConext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalConext);