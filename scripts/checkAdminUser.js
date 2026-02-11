const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function checkAdminUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const adminUser = await User.findOne({ email: "admin@gmail.com" }).select("+password");

        if (!adminUser) {
            console.log("❌ Admin user NOT FOUND in database");
            console.log("Creating admin user with email: admin@gmail.com and password: admin@123");

            const newAdmin = await User.create({
                name: "Admin",
                email: "admin@gmail.com",
                password: "admin@123",
                role: "admin",
            });

            console.log("✅ Admin user created successfully:", {
                _id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
            });
        } else {
            console.log("✅ Admin user FOUND:");
            console.log({
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                hasPassword: !!adminUser.password,
                passwordLength: adminUser.password?.length,
            });

            // Test password matching
            const testPassword = "admin@123";
            const isMatch = await adminUser.matchPassword(testPassword);
            console.log(`\nPassword test for "${testPassword}": ${isMatch ? "✅ MATCHES" : "❌ DOES NOT MATCH"}`);

            if (!isMatch) {
                console.log("\n⚠️  Password doesn't match. Updating password to: admin@123");
                adminUser.password = "admin@123";
                await adminUser.save();
                console.log("✅ Password updated successfully");
            }
        }

        await mongoose.connection.close();
        console.log("\n✅ Script completed");
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkAdminUser();
