const express = require('express');
const router = express.Router();
const {
  createOrUpdateReview,
  getProductReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
/**
 * @swagger
 * tags:
 *   name: UserReviews
 *   description: Customer review endpoints
 */

/**
 * @swagger
 * /user-reviews/{productId}:
 *   post:
 *     summary: Add a review for a product (one per user)
 *     tags: [UserReviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: Great product and fast shipping!
 *     responses:
 *       201:
 *         description: Review added
 *       400:
 *         description: Already reviewed
 *       500:
 *         description: Server error
 */
router.post('/:productId', protect, createOrUpdateReview);

/**
 * @swagger
 * /user-reviews/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [UserReviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to get reviews for
 *     responses:
 *       200:
 *         description: List of product reviews
 *       500:
 *         description: Server error
 */
router.get('/:productId', getProductReviews);

/**
 * @swagger
 * /user-reviews/{id}:
 *   delete:
 *     summary: Delete your own review
 *     tags: [UserReviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 *       404:
 *         description: Review not found or unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteReview);

module.exports = router;
