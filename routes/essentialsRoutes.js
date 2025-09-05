const express = require("express");
const router = express.Router();
const Essentials = require("../models/essentialsModel");

// Create a new essentials section
router.post("/", async (req, res) => {
  try {
    const essentials = new Essentials(req.body);
    await essentials.save();
    res.status(201).json(essentials);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all essentials
router.get("/", async (req, res) => {
  try {
    const essentials = await Essentials.find().populate("cards.products");
    res.json(essentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get essentials by ID
router.get("/:id", async (req, res) => {
  try {
    const essentials = await Essentials.findById(req.params.id).populate("cards.products");
    if (!essentials) return res.status(404).json({ message: "Not found" });
    res.json(essentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update essentials (whole section)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Essentials.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("cards.categories");
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete essentials section
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Essentials.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Essentials deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
