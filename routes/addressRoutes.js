const express = require('express');
const router = express.Router();
const Address = require('../models/Address');

// Create Address
router.post('/create', async (req, res) => {
  try {
    const { userId, phone, street, city, district, pincode, state } = req.body;

    const newAddress = new Address({
      userId,
      phone,
      street,
      city,
      district,
      pincode,
      state
    });

    await newAddress.save();
    res.status(201).json({ message: "Address created successfully", address: newAddress });
  } catch (error) {
    console.error("Create address error:", error);
    res.status(500).json({ error: "Failed to create address" });
  }
});

// Edit Address
router.put('/edit/:id', async (req, res) => {
  try {
    const addressId = req.params.id;
    const updates = req.body;

    const updatedAddress = await Address.findByIdAndUpdate(addressId, updates, { new: true });

    if (!updatedAddress) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.status(200).json({ message: "Address updated", address: updatedAddress });
  } catch (error) {
    console.error("Edit address error:", error);
    res.status(500).json({ error: "Failed to update address" });
  }
});

// Get Addresses by User ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await Address.find({ userId });

    if (!addresses.length) {
      return res.status(404).json({ message: "No addresses found for this user." });
    }

    res.status(200).json({ addresses });
  } catch (error) {
    console.error("Get address error:", error);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});


module.exports = router;
