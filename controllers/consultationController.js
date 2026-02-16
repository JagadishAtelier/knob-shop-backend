// controllers/consultationController.js
const Consultation = require('../models/Consultation');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Make sure this is called at the top level
// POST - Create new consultation
exports.createConsultation = async (req, res) => {
  try {
    // ✅ Destructure data from request body
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

    console.log("MAIL_HOST:", process.env.MAIL_HOST);
    console.log("MAIL_PORT:", process.env.MAIL_PORT);
    console.log("MAIL_USER:", process.env.MAIL_USER);
    console.log("MAIL_PASS:", process.env.MAIL_PASS);
    // ✅ Nodemailer transporter (Brevo SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

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

    // ✅ Send mail
    const info = await transporter.sendMail({
      from: `"Knobsshop Booking" <${process.env.MAIL_SENDER}>`,
      to: "jagadish.atelier@gmail.com",
      subject,
      html,
    });

    // ✅ Console log after success
    console.log("✅ Mail sent successfully");
    console.log("Message ID:", info.messageId);

    res.status(201).json({
      success: true,
      message: "Consultation booked and mail sent successfully",
      data: consultation,
    });

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
