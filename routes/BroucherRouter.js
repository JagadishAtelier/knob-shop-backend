const express = require("express");
const router = express.Router();
const {
  createBrochure,
  getAllBrochures,
  getBrochureById,
  updateBrochure,
  deleteBrochure,
} = require("../controllers/BroucherController");

// Create
router.post("/", createBrochure);

// Read
router.get("/", getAllBrochures);
router.get("/:id", getBrochureById);

// Update
router.put("/:id", updateBrochure);

// Delete
router.delete("/:id", deleteBrochure);

module.exports = router;
