/**
 * Test rental return functionality
 */

async function testRentalReturn() {
  try {
    console.log("🔄 Testing rental return functionality...\n");

    // Step 1: Login to get token
    console.log("1. Logging in...");
    const loginResponse = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@test.com", password: "test123" }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.session.access_token;
    console.log("✅ Login successful\n");

    // Step 2: Check active rental
    console.log("2. Checking active rental...");
    const activeRentalResponse = await fetch(
      "http://localhost:3001/active-rental",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const activeRentalData = await activeRentalResponse.json();
    console.log(
      "Active rental data:",
      JSON.stringify(activeRentalData, null, 2)
    );

    if (activeRentalData.data && activeRentalData.data.booking_id) {
      const bookingId = activeRentalData.data.booking_id;
      console.log(`✅ Found active booking ID: ${bookingId}\n`);

      // Step 3: Return the bike
      console.log("3. Returning bike...");
      const returnResponse = await fetch("http://localhost:3001/return", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: bookingId,
          notes: "Test return - bike in good condition",
        }),
      });

      console.log("Return Status:", returnResponse.status);
      const returnData = await returnResponse.text();
      console.log("Return Response:", returnData);

      if (returnResponse.ok) {
        console.log("✅ Bike returned successfully");
      } else {
        console.log("❌ Bike return failed");
      }
    } else {
      console.log("ℹ️  No active rental found");
    }

    // Step 4: Check booking history
    console.log("\n4. Checking updated booking history...");
    const historyResponse = await fetch("http://localhost:3001/my-bookings", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const historyData = await historyResponse.json();
    console.log("✅ Booking history retrieved");
    console.log("Total bookings:", historyData.meta.total);
    console.log("Summary:", JSON.stringify(historyData.meta.summary, null, 2));
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testRentalReturn();
