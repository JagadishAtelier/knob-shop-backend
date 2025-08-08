const Cart = require("../models/Cart");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const existingCartItem = await Cart.findOne({ userId, productId });

    if (existingCartItem) {
      existingCartItem.quantity += quantity || 1;
      await existingCartItem.save();
      return res.status(200).json({ message: "Cart updated", cart: existingCartItem });
    }

    const cartItem = new Cart({ userId, productId, quantity });
    await cartItem.save();
    res.status(201).json({ message: "Added to cart", cart: cartItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart", error });
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
    const cartItemId = req.params.id;

    const deletedItem = await Cart.findByIdAndDelete(cartItemId);

    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Cart item deleted", item: deletedItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete cart item", error });
  }
};

module.exports = {
  addToCart,
  getCartByUserId,
  deleteCartItem
};
