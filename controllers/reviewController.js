const Review = require('../models/Review');
const Product = require('../models/Product');

// Create or update a review
exports.createOrUpdateReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';

  try {
    // Check if user already reviewed this product (only if not admin)
    if (!isAdmin) {
      const existingReview = await Review.findOne({ product: productId, user: userId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment
    });

    // Update product review stats
    const reviews = await Review.find({ product: productId });

    const averageRating =
      reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    const numReviews = reviews.length;

    await Product.findByIdAndUpdate(productId, {
      $set: {
        'reviewsStats.averageRating': averageRating,
        'reviewsStats.numReviews': numReviews,
      }
    });

    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
