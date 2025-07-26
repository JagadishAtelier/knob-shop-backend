const Brochure = require("../models/Brochuers");

// CREATE brochure
const createBrochureController = async (req, res) => {
    try {
      const { title, description, image } = req.body;
  
      const brochure = new Brochure({
        title,
        description,
        image, // this should be a Cloudinary URL string
      });
  
      const saved = await brochure.save();
      res.status(201).json({ success: true, brochure: saved });
    } catch (error) {
      console.error("Create Brochure Error:", error);
      res.status(500).json({ success: false, message: "Failed to create brochure" });
    }
  };
  

// GET all brochures
const getAllBrochures = async (req, res) => {
  try {
    const brochures = await Brochure.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, brochures });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch brochures" });
  }
};

// GET brochure by ID
const getBrochureById = async (req, res) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) return res.status(404).json({ success: false, message: "Brochure not found" });
    res.status(200).json({ success: true, brochure });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch brochure" });
  }
};

// UPDATE brochure
const updateBrochure = async (req, res) => {
  try {
    const updated = await Brochure.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Brochure not found" });
    res.status(200).json({ success: true, brochure: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update brochure" });
  }
};

// DELETE brochure
const deleteBrochure = async (req, res) => {
  try {
    const deleted = await Brochure.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Brochure not found" });
    res.status(200).json({ success: true, message: "Brochure deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete brochure" });
  }
};

module.exports = {
    createBrochureController,
  getAllBrochures,
  getBrochureById,
  updateBrochure,
  deleteBrochure,
};
