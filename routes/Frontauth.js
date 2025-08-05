const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/FrontUser");
const router = express.Router();

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
  res.json({ token });
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

module.exports = router;
