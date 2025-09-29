// Test Production Deployment
const axios = require("axios");

const BACKEND_URL =
  "https://rentamoto-fs5mftwpr-duttapaarths-projects.vercel.app";
const FRONTEND_URL =
  "https://rentamoto-frontend-rh1mqb5d2-duttapaarths-projects.vercel.app";

console.log("🚀 Testing RENTAMOTO Production Deployment\n");

async function testProduction() {
  try {
    console.log("1. Testing Backend Health...");
    const healthResponse = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 10000,
      validateStatus: () => true, // Accept any status code
    });

    console.log(`   ✅ Backend Status: ${healthResponse.status}`);
    console.log(
      `   📊 Response: ${JSON.stringify(healthResponse.data, null, 2)}`
    );
  } catch (error) {
    console.log(`   ❌ Backend Error: ${error.message}`);
  }

  try {
    console.log("\n2. Testing Backend Environment...");
    const envResponse = await axios.get(`${BACKEND_URL}/`, {
      timeout: 10000,
      validateStatus: () => true,
    });

    console.log(`   ✅ Root Status: ${envResponse.status}`);
  } catch (error) {
    console.log(`   ❌ Root Error: ${error.message}`);
  }

  try {
    console.log("\n3. Testing User Signup...");
    const signupData = {
      email: "test@production.com",
      password: "TestPassword123!",
      name: "Production Test User",
      role: "customer",
    };

    const signupResponse = await axios.post(
      `${BACKEND_URL}/auth/signup`,
      signupData,
      {
        timeout: 15000,
        validateStatus: () => true,
      }
    );

    console.log(`   ✅ Signup Status: ${signupResponse.status}`);
    console.log(
      `   📊 Signup Response: ${JSON.stringify(signupResponse.data, null, 2)}`
    );
  } catch (error) {
    console.log(`   ❌ Signup Error: ${error.message}`);
  }

  console.log("\n🔗 Deployment URLs:");
  console.log(`   Backend:  ${BACKEND_URL}`);
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log("\n🎯 Next Steps:");
  console.log("   1. Open frontend URL in browser");
  console.log("   2. Try creating an account");
  console.log("   3. Test bike rentals");
}

testProduction().catch(console.error);
