import React, { createContext, useContext, useState, useEffect } from "react";
import { server } from "../main";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Use a consistent key ("token") for storing and retrieving the token.
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("token") ? true : false
  );
  const [token, settoken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  // Helper function to fetch the user profile using the token.
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${server}user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Login function to send request and handle response.
  const login = async (email, password) => {
    try {
      const response = await fetch(`${server}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Invalid server response: " + err.message);
      }

      if (response.ok) {
        const token = data.accessToken;
        // Use the same key "token" in localStorage.
        localStorage.setItem("token", token);
        settoken(token);
        setIsAuthenticated(true);
        // Fetch and store the full user profile.
        await fetchUserProfile(token);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      throw error;
    }
  };

  // Logout function to log the user out both server-side and in the frontend state.
  const logout = async () => {
    try {
      const response = await fetch(`${server}auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logged out successfully on server");
      } else {
        const text = await response.text();
        console.warn("Logout response not OK:", text);
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("An error occurred while logging out");
    } finally {
      // Always clear client state.
      localStorage.removeItem("token");
      settoken("");
      setUser(null);
      setIsAuthenticated(false);
      console.log("Logout successful");
    }
  };

  // On mount, if a token exists, fetch the user profile.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, token, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
