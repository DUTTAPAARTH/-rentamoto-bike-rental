/**
 * Test script for protected endpoints
 */

async function testProtectedEndpoints() {
  try {
    console.log("🔐 Testing authentication and protected endpoints...\n");

    // Step 1: Login to get token
    console.log("1. Logging in...");
    const loginResponse = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "demo@test.com",
        password: "test123",
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.session.access_token;
    console.log("✅ Login successful");
    console.log("Token:", token.substring(0, 50) + "...\n");

    // Step 2: Test my-bookings endpoint
    console.log("2. Testing /my-bookings endpoint...");
    try {
      const bookingsResponse = await fetch(
        "http://localhost:3001/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("My-bookings Status:", bookingsResponse.status);
      const bookingsData = await bookingsResponse.text();
      console.log("Response:", bookingsData);

      if (bookingsResponse.ok) {
        console.log("✅ My-bookings successful");
      } else {
        console.log("❌ My-bookings failed");
      }
    } catch (bookingsError) {
      console.log("❌ My-bookings error:", bookingsError.message);
    }

    console.log("\n3. Testing /bikes endpoint...");
    try {
      const bikesResponse = await fetch("http://localhost:3001/bikes");
      console.log("✅ Bikes endpoint successful");
      console.log("Status:", bikesResponse.status);
      const bikesData = await bikesResponse.json();
      console.log("Bikes count:", bikesData.data?.length || 0);
    } catch (bikesError) {
      console.log("❌ Bikes endpoint failed:", bikesError.message);
    }

    console.log("\n4. Testing rental booking...");
    try {
      const rentalResponse = await fetch("http://localhost:3001/rent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bike_id: 1,
          notes: "Test rental booking",
        }),
      });

      console.log("Rental Status:", rentalResponse.status);
      const rentalData = await rentalResponse.text();
      console.log("Rental Response:", rentalData);

      if (rentalResponse.ok) {
        console.log("✅ Rental booking successful");
      } else {
        console.log("❌ Rental booking failed");
      }
    } catch (rentalError) {
      console.log("❌ Rental error:", rentalError.message);
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testProtectedEndpoints();
