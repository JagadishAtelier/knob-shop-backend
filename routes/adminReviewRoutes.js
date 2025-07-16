const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Admin-only review management
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews (admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of reviews
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.user) filter.user = req.query.user;

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name');

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID (admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review by ID (admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: Updated review comment
 *     responses:
 *       200:
 *         description: Review updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();

    res.json({ message: 'Review updated', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
