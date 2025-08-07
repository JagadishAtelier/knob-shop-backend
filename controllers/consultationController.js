// controllers/consultationController.js
const Consultation = require('../models/Consultation');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Make sure this is called at the top level
// POST - Create new consultation
exports.createConsultation = async (req, res) => {
  try {
    const consultation = new Consultation(req.body);
    await consultation.save();

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,       // e.g. youradminemail@gmail.com
        pass: process.env.EMAIL_PASS,       // App password from Gmail
      },
    });

    // Mail content
    const subject = '📝 New Consultation Booking Received';
    const html = `
      <h2>New Book Consultation User Details From Our Knobsshop</h2>
      <p><strong>Name:</strong> ${consultation.name}</p>
      <p><strong>Email:</strong> ${consultation.email}</p>
      <p><strong>Mobile:</strong> ${consultation.mobile}</p>
      <p><strong>WhatsApp:</strong> ${consultation.whatsapp ? 'Yes' : 'No'}</p>
      <p><strong>Location:</strong> ${consultation.location}</p>
      <p><strong>Pincode:</strong> ${consultation.pincode}</p>
      <p><strong>Budget:</strong> ${consultation.budget}</p>
      <p><strong>Interest:</strong> ${consultation.interest}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: `"Knobsshop Booking" <${process.env.EMAIL_USER}>`,
      to: 'ecom@knobsshop.store', // Replace with actual admin email
      subject,
      html,
    });

    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
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
