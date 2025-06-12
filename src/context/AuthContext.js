"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (check localStorage/token)
    // Only access localStorage after component has mounted
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // Get token from localStorage
    // If token exists, fetch user data from localStorage
    // If token is invalid or user data is not found, clear localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  // This function should be called after successful authentication
  // It saves the token and user data to localStorage and updates the user state
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  // This function clears the token and user data from localStorage and updates the user state when logging out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; // Providing auth context to children
};

// Just a custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
export { AuthContext, AuthProvider };
