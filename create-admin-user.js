import dotenv from "dotenv";
dotenv.config();
import { storage } from "./server/storage.ts";
import { AuthService } from "./server/services/authService.ts";

async function createAdminUser() {
  const email = "kefas.chapa@gmail.com";
  const password = "D@abase1";
  const username = "kefas.chapa";

  try {
    console.log(`🔍 Checking if user already exists: ${email}`);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);

    if (existingUser) {
      console.log("✅ User already exists, updating to admin role...");

      if (existingUser.role === "admin") {
        console.log("ℹ️  User is already an admin");
        console.log("\n🎉 You can now access the admin dashboard at:");
        console.log("   - /admin (on both domains)");
        return;
      }

      // Update existing user to admin role
      const updatedUser = await storage.updateUser(existingUser.id, {
        role: "admin",
      });

      if (updatedUser) {
        console.log("✅ Successfully updated existing user to admin role");
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);
        console.log("\n🎉 You can now access the admin dashboard at:");
        console.log("   - /admin (on both domains)");
      } else {
        console.log("❌ Failed to update user role");
        process.exit(1);
      }

      return;
    }

    console.log("📝 Creating new admin user...");

    // Hash the password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create new user with admin role
    const newUser = await storage.createUser({
      email,
      username,
      password: hashedPassword,
      role: "admin",
      firstName: "Kefas",
      lastName: "Chapa",
    });

    if (newUser) {
      console.log("✅ Successfully created new admin user");
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Username: ${newUser.username}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Password: ${password}`);
      console.log("\n🎉 You can now log in and access the admin dashboard at:");
      console.log("   - /admin (on both domains)");
    } else {
      console.log("❌ Failed to create user");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdminUser();
