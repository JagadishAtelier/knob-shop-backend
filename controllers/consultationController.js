// controllers/consultationController.js
const Consultation = require('../models/Consultation');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

// POST - Create new consultation
exports.createConsultation = async (req, res) => {
  try {
    const {
      location,
      category,
      name,
      mobile,
      whatsapp,
      email,
      budget,
      interest
    } = req.body;

    // ✅ Basic validation
    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Mobile are required"
      });
    }

    // ✅ Save to DB
    const consultation = await Consultation.create({
      location,
      category,
      name,
      mobile,
      whatsapp,
      email,
      budget,
      interest
    });

    // ✅ Nodemailer transporter (Brevo SMTP)
    const transporter = require('../utils/mailer');

    // ✅ Email content
    const subject = "📝 New Consultation Booking Received";
    const html = `
      <h2>New Consultation Booking - Knobsshop</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp ? "Yes" : "No"}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Interest:</strong> ${interest}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `;

    // ✅ Send Brevo email
    try {
      const info = await transporter.sendMail({
        from: `"Knobsshop Booking" <${process.env.MAIL_SENDER}>`,
        to: "ecom@knobsshop.store",
        subject,
        html,
      });
      console.log("✅ Mail sent successfully. Message ID:", info.messageId);
    } catch (err) {
      console.error("❌ Error sending mail:", err.message);
    }

    // ✅ Respond to client
    res.status(201).json({
      success: true,
      message: "Consultation booked successfully",
      data: consultation,
    });

    // ✅ Fire-and-forget: Send to Google Sheet via native https (handles Google's 302 redirect properly)
    if (process.env.GOOGLE_SHEET_URL) {
      const https = require('https');
      const payload = JSON.stringify({ name, email, mobile, whatsapp, location, category, budget, interest });
      const url = new URL(process.env.GOOGLE_SHEET_URL);

      const makeRequest = (targetUrl) => {
        const parsedUrl = new URL(targetUrl);
        const options = {
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        };

        const req = https.request(options, (res) => {
          // Google Apps Script does a 302 redirect — follow it
          if (res.statusCode === 302 && res.headers.location) {
            console.log("↩️  Google redirect, following to:", res.headers.location);
            makeRequest(res.headers.location);
            return;
          }
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log("✅ Google Sheet entry saved:", data);
            } else {
              console.error(`❌ Google Sheet responded with ${res.statusCode}:`, data);
            }
          });
        });

        req.on('error', (err) => console.error("❌ Google Sheet request error:", err.message));
        req.write(payload);
        req.end();
      };

      makeRequest(process.env.GOOGLE_SHEET_URL);
    }

  } catch (error) {
    console.error("❌ Error in createConsultation:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET - Fetch all consultations
exports.getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
