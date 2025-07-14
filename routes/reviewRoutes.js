const express = require('express');
const router = express.Router();
const {
  createOrUpdateReview,
  getProductReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

// POST or PUT review (one per user per product)
router.post('/:productId', protect, createOrUpdateReview);

// GET all reviews for a product
router.get('/:productId', getProductReviews);

// DELETE review (by user)
router.delete('/:id', protect, deleteReview);

module.exports = router;
