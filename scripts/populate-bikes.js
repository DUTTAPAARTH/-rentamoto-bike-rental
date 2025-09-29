/**
 * RENTAMOTO - Bike Data Population Script
 *
 * This script populates the database with a comprehensive set of bike data
 * for testing and demonstration purposes.
 */

const API_BASE = "http://localhost:3001";

// Sample bike data with various categories and features
const bikesData = [
  // City Bikes
  {
    model: "Urban Cruiser Pro",
    brand: "RENTAMOTO",
    price_per_hour: 12,
    description:
      "Perfect city bike with comfortable seating and smooth ride. Features include basket, LED lights, and anti-theft lock.",
    image_url:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7589,
    longitude: -73.9851,
    battery_level: null,
  },
  {
    model: "City Commuter Plus",
    brand: "RENTAMOTO",
    price_per_hour: 10,
    description:
      "Reliable commuter bike with 7-speed gear system and weather-resistant features.",
    image_url:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7505,
    longitude: -73.9934,
    battery_level: null,
  },
  {
    model: "Metro Glide",
    brand: "RENTAMOTO",
    price_per_hour: 11,
    description:
      "Lightweight aluminum frame city bike with puncture-resistant tires and adjustable seat.",
    image_url:
      "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7614,
    longitude: -73.9776,
    battery_level: null,
  },

  // Electric Bikes
  {
    model: "E-Power Urban",
    brand: "RENTAMOTO",
    price_per_hour: 25,
    description:
      "Premium electric bike with 50-mile range, USB charging port, and GPS tracking.",
    image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7484,
    longitude: -73.9857,
    battery_level: 85,
  },
  {
    model: "Thunder Bolt E-Bike",
    brand: "RENTAMOTO",
    price_per_hour: 28,
    description:
      "High-performance electric bike with turbo mode, regenerative braking, and smart display.",
    image_url:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7692,
    longitude: -73.9442,
    battery_level: 92,
  },
  {
    model: "Eco Cruiser Electric",
    brand: "RENTAMOTO",
    price_per_hour: 22,
    description:
      "Eco-friendly electric bike with solar charging capability and efficient motor.",
    image_url:
      "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7282,
    longitude: -74.0776,
    battery_level: 78,
  },

  // Mountain Bikes
  {
    model: "Trail Blazer Pro",
    brand: "RENTAMOTO",
    price_per_hour: 18,
    description:
      "Rugged mountain bike with full suspension, 21-speed transmission, and all-terrain tires.",
    image_url:
      "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7829,
    longitude: -73.9654,
    battery_level: null,
  },
  {
    model: "Alpine Adventure",
    brand: "RENTAMOTO",
    price_per_hour: 20,
    description:
      "Professional-grade mountain bike with carbon fiber frame and hydraulic disc brakes.",
    image_url:
      "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7736,
    longitude: -73.9566,
    battery_level: null,
  },

  // Road Bikes
  {
    model: "Speed Demon",
    brand: "RENTAMOTO",
    price_per_hour: 22,
    description:
      "Aerodynamic road bike perfect for racing and long-distance rides with drop handlebars.",
    image_url:
      "https://images.unsplash.com/photo-1553978297-833d24758ffa?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7397,
    longitude: -74.0025,
    battery_level: null,
  },
  {
    model: "Carbon Racer",
    brand: "RENTAMOTO",
    price_per_hour: 26,
    description:
      "Ultra-lightweight carbon fiber road bike with 16-speed Shimano gear system.",
    image_url:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7505,
    longitude: -73.9751,
    battery_level: null,
  },

  // Hybrid Bikes
  {
    model: "All-Terrain Hybrid",
    brand: "RENTAMOTO",
    price_per_hour: 15,
    description:
      "Versatile hybrid bike suitable for both city streets and light trail riding.",
    image_url:
      "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7677,
    longitude: -73.954,
    battery_level: null,
  },
  {
    model: "Comfort Cruiser",
    brand: "RENTAMOTO",
    price_per_hour: 13,
    description:
      "Comfortable hybrid with upright riding position, wide padded seat, and smooth suspension.",
    image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7433,
    longitude: -74.0014,
    battery_level: null,
  },

  // Folding Bikes
  {
    model: "Compact Folder",
    brand: "RENTAMOTO",
    price_per_hour: 14,
    description:
      "Ultra-portable folding bike that fits in car trunks and under desks. Perfect for commuters.",
    image_url:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
    latitude: 40.758,
    longitude: -73.9855,
    battery_level: null,
  },
  {
    model: "Travel Buddy",
    brand: "RENTAMOTO",
    price_per_hour: 16,
    description:
      "Premium folding bike with quick-release mechanisms and travel case included.",
    image_url:
      "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7549,
    longitude: -73.984,
    battery_level: null,
  },

  // Specialty Bikes
  {
    model: "Cargo Master",
    brand: "RENTAMOTO",
    price_per_hour: 20,
    description:
      "Heavy-duty cargo bike with large front basket and rear rack. Perfect for deliveries.",
    image_url:
      "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7282,
    longitude: -74.0776,
    battery_level: null,
  },
  {
    model: "Tandem Explorer",
    brand: "RENTAMOTO",
    price_per_hour: 30,
    description:
      "Two-person tandem bike for couples and friends to ride together. Features dual braking system.",
    image_url:
      "https://images.unsplash.com/photo-1553978297-833d24758ffa?auto=format&fit=crop&w=500&q=60",
    latitude: 40.7738,
    longitude: -73.9738,
    battery_level: null,
  },
];

// Admin credentials (you'll need to update these with actual admin credentials)
let adminToken = null;

const loginAsAdmin = async () => {
  try {
    console.log("Logging in as admin...");
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@rentamoto.com",
        password: "Admin123!",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    adminToken = data.token;
    console.log("✅ Admin login successful");
    return true;
  } catch (error) {
    console.error("❌ Admin login failed:", error.message);
    console.log("\n💡 Please make sure you have an admin account with:");
    console.log("   Email: admin@rentamoto.com");
    console.log("   Password: Admin123!");
    console.log("   Role: admin");
    return false;
  }
};

const createBike = async (bikeData) => {
  try {
    const response = await fetch(`${API_BASE}/bikes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bikeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(
      `❌ Failed to create bike "${bikeData.model}":`,
      error.message
    );
    return null;
  }
};

const populateBikes = async () => {
  console.log("🚲 RENTAMOTO Bike Data Population Script\n");
  console.log(
    "📊 Preparing to add",
    bikesData.length,
    "bikes to the database...\n"
  );

  // First, login as admin
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    return;
  }

  let successCount = 0;
  let failCount = 0;

  // Create each bike
  for (let i = 0; i < bikesData.length; i++) {
    const bikeData = bikesData[i];
    console.log(
      `📝 Creating bike ${i + 1}/${bikesData.length}: ${bikeData.model}...`
    );

    const result = await createBike(bikeData);
    if (result) {
      console.log(
        `✅ Successfully created: ${result.model} (ID: ${result.id})`
      );
      successCount++;
    } else {
      failCount++;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n🏁 Population Complete!");
  console.log(`✅ Successfully created: ${successCount} bikes`);
  console.log(`❌ Failed to create: ${failCount} bikes`);
  console.log(
    `📊 Total bikes in database: ${
      successCount + 1
    } (including existing bikes)\n`
  );

  // Fetch and display final count
  try {
    const response = await fetch(`${API_BASE}/bikes`);
    const data = await response.json();
    const totalBikes = data.data.length;
    console.log(
      `🎯 Final verification: ${totalBikes} bikes available in the system`
    );
  } catch (error) {
    console.log("Could not verify final count");
  }
};

// Run the population script
populateBikes().catch((error) => {
  console.error("💥 Script failed with error:", error);
  process.exit(1);
});
