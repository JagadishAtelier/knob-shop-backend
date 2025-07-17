const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const generateToken = require("../utils/generateToken");
const Cart = require("../models/Cart");
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id, user.role)
});

};

exports.login = async (req, res) => {
  console.log("Request body:", req.body); 
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await User.findOne({ email });
  console.log("Entered password:", password);
console.log("Hashed password in DB:", user?.password);
const isMatch = await user.matchPassword(password);
console.log("Do they match?", isMatch);
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  const otpExpiresAt = Date.now() + 10 * 60 * 1000; // valid for 10 minutes

  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  // send email using nodemailer
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    to: user.email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: "OTP sent to your email" });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || Date.now() > user.otpExpiresAt) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.password = newPassword; 
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};

exports.getUserByIdWithCart = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItems = await Cart.find({ userId })
      .populate("productId")
      .lean();

    res.status(200).json({
      ...user,
      cartItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user with cart", error });
  }
};

exports.getAllUsersWithCart = async (req, res) => {
  try {
    const users = await User.find().lean();

    const usersWithCart = await Promise.all(
      users.map(async (user) => {
        const cartItems = await Cart.find({ userId: user._id })
          .populate("productId")
          .lean();

        return {
          ...user,
          cartItems,
        };
      })
    );

    res.status(200).json(usersWithCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users with cart", error });
  }
};
  