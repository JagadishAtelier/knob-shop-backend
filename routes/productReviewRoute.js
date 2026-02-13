const express = require('express');
const router = express.Router();
const {
  createOrUpdateReview,
  getReviewsByProduct,
  deleteReview,
  getAllReviews
} = require('../controllers/productReviewController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
// Create or Update a Review (userId in body)
router.post('/:productId',createOrUpdateReview);

// Get all reviews for a product
router.get('/:productId', getReviewsByProduct);

// Delete a review (userId in body)
router.delete("/:reviewId", protect, deleteReview);

router.get("/", getAllReviews);

module.exports = router;
