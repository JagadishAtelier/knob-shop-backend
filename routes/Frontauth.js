const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/FrontUser");
const Otp = require("../models/otp");
const router = express.Router();
const transporter = require("../utils/mailer");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ✅ Check if user exists
router.get("/check", async (req, res) => {
  try {
    const phoneRaw = req.query.phone;
    const cleanPhone = phoneRaw?.replace(/\s+/g, "").replace(/^(\+)?/, "+");
    const cleanEmail = req.query.email?.trim()?.toLowerCase();

    const query = req.query.email
      ? { email: cleanEmail }
      : { phone: cleanPhone };

    const user = await User.findOne(query);

    res.json({ exists: !!user });
  } catch (err) {
    console.error("User check failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login user
router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Require either email+password or phone
    if ((!email && !phone) || (email && !password)) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = phone?.trim();

    const user = await User.findOne(
      normalizedEmail ? { email: normalizedEmail } : { phone: normalizedPhone }
    );

    if (!user) return res.status(401).json({ error: "User not found" });

    // If email login, require password
    if (email) {
      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ error: "Invalid password" });
    }

    // Phone login doesn't require password (assumes OTP was verified already)
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cartCount: user.cart?.length || 0,
        wishlistCount: user.wishlist?.length || 0,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Signup user
router.post("/signup", async (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    return res.status(400).json({ error: "Missing signup data" });
  }

  const exists = await User.findOne(email ? { email } : { phone });
  if (exists) return res.status(409).json({ error: "User already exists" });

  const user = new User({ email, phone, password });
  await user.save();

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cartCount: user.cart?.length || 0,
        wishlistCount: user.wishlist?.length || 0,
      }, });
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("wishlist"); 

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Failed to get user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Optional: Check if the email is being changed
    if (updateData.email) {
      const user = await User.findById(id);

      if (user.email !== updateData.email) {
        const existing = await User.findOne({ email: updateData.email });
        if (existing && existing._id.toString() !== id.toString()) {
          return res
            .status(400)
            .json({ error: "Email already in use by another account." });
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const otpStore = new Map();
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normalizedEmail = email.trim().toLowerCase();

    // Optional: Find user for name personalization
    const user = await User.findOne({ email: normalizedEmail });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await Otp.deleteMany({ email: normalizedEmail });
    
    // Create a new OTP document
    const newOtp = new Otp({
      email: normalizedEmail,
      otp: otp,
    });
    await newOtp.save();

    const mailOptions = {
      from: `"Knobsshop" <${process.env.MAIL_SENDER}>`,
      to: normalizedEmail,
      subject: "Your OTP for Knobsshop Login",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; color: #333;">
        <div style="display: flex; justify-content: center; align-items: center;">
          <img src="https://knobsshop.store/assets/logo-CnQfNeT-.png" alt="Knobsshop Logo" style="height: 40px;" />
        </div>
        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;" />
        <h2 style="color: #aa7e5a;">Knobsshop Login</h2>
        <p>Hi ${user?.name || "User"},</p>
        <p>We received a request to login. Use the OTP below to continue:</p>
        <p style="font-size: 36px; text-align: center; font-weight: bold; color: #e18436; margin: 20px 0;">${otp}</p>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;" />
        <p style="font-size: 12px; color: #6b7280;">&copy; ${new Date().getFullYear()} KnobsShop. All rights reserved.</p>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find the OTP in the database
    const storedOtp = await Otp.findOne({
      email: normalizedEmail,
      otp: otp,
    });

    if (!storedOtp) {
      // If the OTP is not found, it means it's either incorrect or expired (TTL index took care of it)
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Since the TTL index automatically handles expiration, we just need to delete the used OTP
    await Otp.deleteOne({ _id: storedOtp._id });

    // Logic for successful verification (e.g., login the user, create a session, generate a token)
    // ...

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});
module.exports = router;
