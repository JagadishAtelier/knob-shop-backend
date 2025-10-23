const express = require("express");
const SharedCart  = require("../models/SharedCart.js");
const crypto  = require( "crypto");

const router = express.Router();

// Create a shareable cart link
router.post("/share-cart", async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    const token = crypto.randomBytes(8).toString("hex"); // unique short token
    await SharedCart.create({ token, items });

    res.json({ link: `${process.env.FRONTEND_URL}/share-cart/${token}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create share link" });
  }
});

// Retrieve shared cart by token
router.get("/:token", async (req, res) => {
  try {
    const cart = await SharedCart.findOne({ token: req.params.token });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: "Failed to load shared cart" });
  }
});

module.exports = router;
