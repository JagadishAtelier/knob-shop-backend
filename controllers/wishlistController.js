const User = require("../models/User");

exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.likedProducts.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.likedProducts.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to wishlist", likedProducts: user.likedProducts });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to wishlist", error });
  }
};

// 📥 Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("likedProducts");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.likedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error });
  }
};

// ❌ Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.likedProducts = user.likedProducts.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({ message: "Product removed from wishlist", likedProducts: user.likedProducts });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from wishlist", error });
  }
};
