const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

// Public Routes
router.get("/", categoryController.getCategoriesWithProductCount);
router.get("/:id", categoryController.getCategoryById);

// Admin Routes
router.post("/", protect, adminOnly, categoryController.createCategory);
router.put("/:id", protect, adminOnly, categoryController.updateCategory);
router.delete("/:id", protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
