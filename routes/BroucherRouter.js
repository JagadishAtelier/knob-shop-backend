const express = require("express");
const router = express.Router();
const {
    createBrochureController,
  getAllBrochures,
  getBrochureById,
  updateBrochure,
  deleteBrochure,
} = require("../controllers/BroucherController");

// Create
router.post("/", createBrochureController);

// Read
router.get("/", getAllBrochures);
router.get("/:id", getBrochureById);

// Update
router.put("/:id", updateBrochure);

// Delete
router.delete("/:id", deleteBrochure);

module.exports = router;
