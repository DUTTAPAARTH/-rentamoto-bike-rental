// Simple API test script
const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testSignup() {
  try {
    console.log("Testing signup...");
    const signupData = {
      email: "test@example.com",
      password: "test123",
      name: "Test User",
      role: "customer",
    };

    const response = await axios.post(`${API_BASE}/auth/signup`, signupData);
    console.log("Signup Success!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log("Signup Error:");
    console.log("Status:", error.response?.status);
    console.log("Message:", error.response?.data?.message);
    console.log("Details:", error.response?.data?.details);
    console.log("Full error:", JSON.stringify(error.response?.data, null, 2));
    return null;
  }
}

async function testLogin() {
  try {
    console.log("\nTesting login...");
    const loginData = {
      email: "test@example.com",
      password: "test123",
    };

    const response = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log("Login Success!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log("Login Error:");
    console.log("Status:", error.response?.status);
    console.log("Message:", error.response?.data?.message);
    console.log("Details:", error.response?.data?.details);
    console.log("Full error:", JSON.stringify(error.response?.data, null, 2));
    return null;
  }
}

async function runTests() {
  // Test signup first
  const signupResult = await testSignup();

  // If signup succeeded or user already exists, try login
  await testLogin();
}

runTests();
