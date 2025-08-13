const express = require('express');
const router = express.Router();
const {
  createOrUpdateReview,
  getReviewsByProduct,
  deleteReview
} = require('../controllers/productReviewController');
const upload = require('../middlewares/upload');
// Create or Update a Review (userId in body)
router.post('/:productId',upload.single('image'), createOrUpdateReview);

// Get all reviews for a product
router.get('/:productId', getReviewsByProduct);

// Delete a review (userId in body)
router.delete('/:reviewId', deleteReview);

module.exports = router;
