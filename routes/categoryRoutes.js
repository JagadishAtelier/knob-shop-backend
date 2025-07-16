const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management and product count
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories with product count
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories with product counts
 *       500:
 *         description: Server error
 */
router.get("/", categoryController.getCategoriesWithProductCount);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details with product count
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *               - description
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Devices and gadgets
 *               categoryImageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Category already exists
 *       500:
 *         description: Server error
 */
router.post("/", protect, adminOnly, categoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: New Category Name
 *               description:
 *                 type: string
 *                 example: Updated description
 *               categoryImageUrl:
 *                 type: string
 *                 example: https://example.com/newimage.jpg
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, adminOnly, categoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category by ID (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
