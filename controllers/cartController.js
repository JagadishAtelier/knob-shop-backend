const Cart = require("../models/Cart");
const User = require("../models/FrontUser");
const addToCart = async (req, res) => {
  try {
    const {
      userId,
      productId,
      quantity,
      colorName,
      colorCode,
      sizeLabel,
      mrp,
      discountPercentage,
      taxPercentage,
      sellingPrice,
      image,
      mode,  // 👈 NEW (increment | set)
    } = req.body;

    const existingCartItem = await Cart.findOne({
      userId,
      productId,
      colorCode,
      sizeLabel,
    });

    // If variant exists
    if (existingCartItem) {

      if (mode === "set") {
        // ✅ EXACT quantity replace
        existingCartItem.quantity = quantity;
      } else {
        // ✅ Default: Increment
        existingCartItem.quantity += quantity || 1;
      }

      // Auto delete if zero or negative
      if (existingCartItem.quantity <= 0) {
        await Cart.deleteOne({ _id: existingCartItem._id });
        return res.status(200).json({
          message: "Item removed from cart",
        });
      }

      await existingCartItem.save();
      return res.status(200).json({
        message: mode === "set" ? "Cart quantity replaced" : "Cart updated",
        cart: existingCartItem,
      });
    }

    // If new item
    const cartItem = new Cart({
      userId,
      productId,
      quantity,
      colorName,
      colorCode,
      sizeLabel,
      mrp,
      discountPercentage,
      taxPercentage,
      sellingPrice,
      image,
    });

    await cartItem.save();

    res.status(201).json({
      message: "Added variant to cart",
      cart: cartItem,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add to cart",
      error,
    });
  }
};


const getCartByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cartItems = await Cart.find({ userId })
      .populate("productId")
      .populate("userId", "name email");

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the cart item for this user and product
    const deletedItem = await Cart.findOneAndDelete({
      userId,
      productId,
      colorCode: req.body.colorCode,
      sizeLabel: req.body.sizeLabel,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({
      message: "Cart item deleted successfully",
      item: deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete cart item",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCartByUserId,
  deleteCartItem,
};
