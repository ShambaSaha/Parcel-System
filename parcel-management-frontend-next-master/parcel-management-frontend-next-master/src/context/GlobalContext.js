import { createContext, useContext, useReducer, useState, useEffect } from "react";

const GlobalConext = createContext(null);

export const GlobalConextProvider = ({ children }) => {
  const [state, dispatch] = useReducer((s) => s, {});
  const [token, setToken] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [role, setRole] = useState(null);

  const loginUser = (userRole) => {
    setIsLoggedIn(true);
    setRole(userRole);
  };
  // 🔑 Read localStorage ONLY on client

  let isLoggedIn = !!token;

  const storeTokenInLS = (serverToken) => {
    setToken(serverToken);
    return localStorage.setItem("token", serverToken);
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsHydrated(true);
  }, []);

  const LogoutUser = () => {
    setToken("");
    return localStorage.removeItem("token");

  }



  if (!isHydrated) {
    return null; // or a loader
  }


  return (
    <GlobalConext.Provider value={{ isLoggedIn, storeTokenInLS, role, loginUser, LogoutUser }}>
      {children}
    </GlobalConext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalConext);
