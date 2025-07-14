const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

// @desc GET all reviews (optional filters: ?product= & ?user=)
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

// @desc DELETE review by ID (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc (Optional) UPDATE review
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