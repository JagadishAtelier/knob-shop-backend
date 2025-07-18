const express = require('express');
const router = express.Router();
const {
  removeFromWishlist,
  getWishlist,
  addToWishlist
} = require('../controllers/wishlistController');

/**
 * @swagger
 * /wishlist/add:
 *   post:
 *     summary: Add a product to user's wishlist
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *             properties:
 *               userId:
 *                 type: string
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to wishlist
 */
router.post('/add', addToWishlist);

/**
 * @swagger
 * /wishlist/get/{id}:
 *   get:
 *     summary: Get wishlist items for a user
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of wishlist products
 */
router.get('/get/:id', getWishlist);

/**
 * @swagger
 * /wishlist/delete/{id}:
 *   delete:
 *     summary: Remove a product from wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 */
router.delete('/delete', removeFromWishlist);

module.exports = router;
