const User = require("../models/FrontUser");

exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to wishlist", error });
  }
};

// 📥 Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.params.id; 
    
    const user = await User.findOne({ _id: userId }).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.wishlist);
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

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from wishlist", error });
  }
};
