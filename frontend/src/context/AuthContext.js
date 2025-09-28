import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

// Initial state
const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

// Action types
const ActionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  CLEAR_USER: "CLEAR_USER",
  UPDATE_USER: "UPDATE_USER",
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case ActionTypes.CLEAR_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is admin
  const isAdmin = state.user?.is_admin || false;

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        return;
      }

      try {
        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Verify token and get user data
        const response = await axios.get("http://localhost:3001/auth/me");
        dispatch({ type: ActionTypes.SET_USER, payload: response.data.user });
      } catch (error) {
        console.error("Token verification failed:", error);
        // Clear invalid token
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        dispatch({ type: ActionTypes.CLEAR_USER });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      const response = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });

      const { user, session } = response.data.data;
      const token = session.access_token;

      // Store token
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      dispatch({ type: ActionTypes.SET_USER, payload: user });

      return response.data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      const response = await axios.post("http://localhost:3001/auth/signup", {
        name,
        email,
        password,
      });

      const { user, session } = response.data.data;
      const token = session.access_token;

      // Store token
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      dispatch({ type: ActionTypes.SET_USER, payload: user });

      return response.data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    dispatch({ type: ActionTypes.CLEAR_USER });
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ type: ActionTypes.UPDATE_USER, payload: userData });
  };

  // Context value
  const value = {
    user: state.user,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
