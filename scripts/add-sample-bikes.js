/**
 * Simple Bike Data Population Script
 * Adds sample bikes directly to the database for testing
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const sampleBikes = [
  {
    model: "Urban Cruiser Pro",
    brand: "RENTAMOTO",
    price_per_hour: 12,
    description:
      "Perfect city bike with comfortable seating and smooth ride. Features include basket, LED lights, and anti-theft lock.",
    image_url:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7589,
    longitude: -73.9851,
  },
  {
    model: "E-Power Urban",
    brand: "RENTAMOTO",
    price_per_hour: 25,
    description:
      "Premium electric bike with 50-mile range, USB charging port, and GPS tracking.",
    image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7484,
    longitude: -73.9857,
    battery_level: 85,
  },
  {
    model: "Trail Blazer Pro",
    brand: "RENTAMOTO",
    price_per_hour: 18,
    description:
      "Rugged mountain bike with full suspension, 21-speed transmission, and all-terrain tires.",
    image_url:
      "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7829,
    longitude: -73.9654,
  },
  {
    model: "Speed Demon",
    brand: "RENTAMOTO",
    price_per_hour: 22,
    description:
      "Aerodynamic road bike perfect for racing and long-distance rides with drop handlebars.",
    image_url:
      "https://images.unsplash.com/photo-1553978297-833d24758ffa?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7397,
    longitude: -74.0025,
  },
  {
    model: "All-Terrain Hybrid",
    brand: "RENTAMOTO",
    price_per_hour: 15,
    description:
      "Versatile hybrid bike suitable for both city streets and light trail riding.",
    image_url:
      "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7677,
    longitude: -73.954,
  },
  {
    model: "Compact Folder",
    brand: "RENTAMOTO",
    price_per_hour: 14,
    description:
      "Ultra-portable folding bike that fits in car trunks and under desks. Perfect for commuters.",
    image_url:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.758,
    longitude: -73.9855,
  },
  {
    model: "Thunder Bolt E-Bike",
    brand: "RENTAMOTO",
    price_per_hour: 28,
    description:
      "High-performance electric bike with turbo mode, regenerative braking, and smart display.",
    image_url:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7692,
    longitude: -73.9442,
    battery_level: 92,
  },
  {
    model: "Carbon Racer",
    brand: "RENTAMOTO",
    price_per_hour: 26,
    description:
      "Ultra-lightweight carbon fiber road bike with 16-speed Shimano gear system.",
    image_url:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7505,
    longitude: -73.9751,
  },
  {
    model: "Cargo Master",
    brand: "RENTAMOTO",
    price_per_hour: 20,
    description:
      "Heavy-duty cargo bike with large front basket and rear rack. Perfect for deliveries.",
    image_url:
      "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
    is_available: true,
    latitude: 40.7282,
    longitude: -74.0776,
  },
  {
    model: "Tandem Explorer",
    brand: "RENTAMOTO",
    price_per_hour: 30,
    description:
      "Two-person tandem bike for couples and friends to ride together. Features dual braking system.",
    image_url:
      "https://images.unsplash.com/photo-1553978297-833d24758ffa?auto=format&fit=crop&w=500&q=60",
    is_available: false,
    latitude: 40.7738,
    longitude: -73.9738,
  },
];

const populateBikes = async () => {
  console.log("🚲 Adding sample bikes to database...\n");

  try {
    // Insert bikes using Supabase client
    const { data, error } = await supabase
      .from("bikes")
      .insert(sampleBikes)
      .select();

    if (error) {
      console.error("❌ Error inserting bikes:", error);
      return;
    }

    console.log(`✅ Successfully added ${data.length} bikes to the database!`);
    console.log("\n📊 Added bikes:");
    data.forEach((bike, index) => {
      console.log(
        `   ${index + 1}. ${bike.model} - $${bike.price_per_hour}/hr`
      );
    });

    // Verify total count
    const { data: allBikes, error: countError } = await supabase
      .from("bikes")
      .select("id, model")
      .eq("is_available", true);

    if (!countError) {
      console.log(`\n🎯 Total available bikes: ${allBikes.length}`);
    }
  } catch (error) {
    console.error("💥 Script failed:", error);
  }
};

populateBikes();
