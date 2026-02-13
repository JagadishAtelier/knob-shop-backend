const Review = require('../models/Review');
const Product = require('../models/Product');
const cloudinary = require('../middlewares/Cloudinary');
exports.createOrUpdateReview = async (req, res) => {
    console.log("========= REVIEW API HIT =========");

  console.log("📌 Params:", req.params);
  console.log("📦 Body:", req.body);
  console.log("👤 User:", req.user);
  console.log("🖼 Image from body:", req.body.image);
  console.log("==================================");
  const { productId } = req.params;
  const { rating, comment, image } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  console.log("BODY RECEIVED:", req.body);
  try {

    let review;
    console.log("BODY RECEIVED:", req.body);
    // 👤 NORMAL USER → Update if exists
    if (!isAdmin) {
      review = await Review.findOne({
        product: productId,
        user: userId
      });

      if (review) {
        review.rating = rating;
        review.comment = comment;

        // Only update image if it exists
        if (image && image.length > 0) {
          review.image = image;
        }

        review.createdAt = Date.now();
        await review.save();

        return res.status(200).json({
          message: "Review updated successfully",
          review
        });
      }
    }

    // 👑 ADMIN OR FIRST TIME USER → Create new review
    review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment,
      image
    });

    // 🔄 Recalculate product stats
    const reviews = await Review.find({ product: productId });

    const averageRating =
      reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      $set: {
        'reviewsStats.averageRating': averageRating,
        'reviewsStats.numReviews': reviews.length,
      }
    });

    res.status(201).json({
      message: "Review added successfully",
      review
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
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
