const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
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

  user.password = newPassword; // hash with bcrypt ideally
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};
