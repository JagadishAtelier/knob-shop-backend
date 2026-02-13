const Review = require('../models/Review');
const Product = require('../models/Product');
const cloudinary = require('../middlewares/Cloudinary');
const streamifier = require("streamifier");

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
    let imageUrls = [];

    // 1️⃣ If frontend sends URLs (ARRAY)
    if (req.body.image) {
      imageUrls = Array.isArray(req.body.image)
        ? req.body.image
        : [req.body.image];
    }

    // Check if the user already reviewed this product
    let review = await Review.findOne({ product: productId, user: userId });

    if (review) {
      review.rating = rating;
      review.comment = comment || review.comment;

      if (imageUrls.length > 0) {
        review.image = imageUrls;   // ✅ SAVE FULL ARRAY
      }

      await review.save();
      return res.status(200).json({
        message: "Review updated successfully",
        review
      });
    }

    // Create a new review
    review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
      image: imageUrl
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

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // ✅ Allow if owner OR admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get All Reviews (Admin or Global)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name images") // also fetch product name & image
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
