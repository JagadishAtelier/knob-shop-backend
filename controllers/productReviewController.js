const Review = require('../models/Review');
const Product = require('../models/Product');

// Create or Update a Review
exports.createOrUpdateReview = async (req, res) => {
  const { productId } = req.params;
  const { userId, rating, comment } = req.body; // userId comes from body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user already reviewed this product
    let review = await Review.findOne({ product: productId, user: userId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment || review.comment;
      await review.save();
      return res.status(200).json({ message: "Review updated successfully", review });
    }

    // Create a new review
    review = new Review({
      product: productId,
      user: userId,
      rating,
      comment
    });
    await review.save();

    res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Reviews for a Product
exports.getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a Review
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only allow owner to delete
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
