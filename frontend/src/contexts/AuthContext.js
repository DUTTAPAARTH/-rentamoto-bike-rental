import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
axios.defaults.baseURL = API_BASE_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem("rentamoto_user");
        const savedToken = localStorage.getItem("rentamoto_token");

        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);

          // Check if token is still valid
          const tokenData = parseJWT(savedToken);
          if (tokenData && tokenData.exp > Date.now() / 1000) {
            setUser(userData);
            setToken(savedToken);
            // Set axios default header
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${savedToken}`;
          } else {
            // Token expired, clear storage
            localStorage.removeItem("rentamoto_user");
            localStorage.removeItem("rentamoto_token");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("rentamoto_user");
        localStorage.removeItem("rentamoto_token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const parseJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔐 Attempting login with:", { email, password: "***" });

      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      console.log("✅ Login response:", response.data);

      if (response.data.success && response.data.data) {
        const { user: userData, session } = response.data.data;

        // Store user and token
        setUser(userData);
        setToken(session.access_token);

        // Persist to localStorage
        localStorage.setItem("rentamoto_user", JSON.stringify(userData));
        localStorage.setItem("rentamoto_token", session.access_token);

        // Set axios default header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${session.access_token}`;

        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name, role = "customer") => {
    try {
      setLoading(true);
      setError(null);

      console.log("📝 Attempting signup with:", {
        email,
        name,
        role,
        password: "***",
      });

      const response = await axios.post("/auth/signup", {
        email,
        password,
        name,
        role,
      });

      console.log("✅ Signup response:", response.data);

      if (response.data.success) {
        // Auto-login after successful signup
        const loginResult = await login(email, password);
        return loginResult;
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem("rentamoto_user");
    localStorage.removeItem("rentamoto_token");

    // Clear axios default header
    delete axios.defaults.headers.common["Authorization"];

    console.log("👋 User logged out");
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
