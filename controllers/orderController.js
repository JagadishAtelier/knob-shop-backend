// controllers/order.controller.js
const Order = require("../models/Order");
const User = require("../models/FrontUser");
const Address = require("../models/userAddress");
const normalize = (str) => str?.trim().toLowerCase();
const createOrderWithShipping = async (req, res) => {
  try {
    const orderData = req.body;
    console.log("Order Data:", orderData);
    // Validate order data
    if (!orderData.userId || !orderData.items || !orderData.shippingAddress) {
      return res.status(400).json({ message: "Missing required order data" });
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item" });
    }

    orderData.items.forEach((item) => {
      item.total = item.quantity * item.price;
    });

    orderData.totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const newOrder = new Order(orderData);
    await newOrder.save();

    if (orderData.userId && orderData.shippingAddress) {
      const user = await User.findById(orderData.userId).populate("address");
      const existingAddress = user?.address;

      const isSameAddress =
        existingAddress &&
        normalize(existingAddress.phone) ===
          normalize(orderData.shippingAddress.phone) &&
        normalize(existingAddress.street) ===
          normalize(orderData.shippingAddress.street) &&
        normalize(existingAddress.city) ===
          normalize(orderData.shippingAddress.city) &&
        normalize(existingAddress.district) ===
          normalize(orderData.shippingAddress.district) &&
        normalize(existingAddress.pincode) ===
          normalize(orderData.shippingAddress.pincode) &&
        normalize(existingAddress.state) ===
          normalize(orderData.shippingAddress.state);

      if (!isSameAddress) {
        const newAddress = new Address({
          ...orderData.shippingAddress,
          userId: orderData.userId, // ✅ explicitly pass userId
        });
        await newAddress.save();

        user.address = newAddress._id;
        await user.save();
      }
    }
    res
      .status(200)
      .json({ message: "Order and shipping label created", order: newOrder });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Order creation failed", error: error.message });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email") // Populate user info if needed
      .populate("items.productId") // Populate product details if productId exists
      .sort({ createdAt: -1 }); // Optional: show latest orders first

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("items.productId");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      });
  }
};

// Delete an order by ID
const deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Order deleted successfully",
        deletedOrder,
      });
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete order",
        error: error.message,
      });
  }
};

/**
 * Update order by custom orderId (e.g., ORD-0020)
 * Expects JSON body with fields to update.
 */
const updateOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params; // from URL param like /orders/by-order-id/:orderId

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const updates = req.body;

    const allowedFields = [
      "status",
      "paymentStatus",
      "shippingStatus",
      "paymentReference",
      "totalAmount",
    ];
    const invalidFields = Object.keys(updates).filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields in update: ${invalidFields.join(", ")}`,
      });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId }, // ✅ query by custom orderId field
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found with given orderId" });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order by orderId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const orders = await Order.find({ userId })
      .populate("userId", "name email")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders by userId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


module.exports = {
  createOrderWithShipping,
  updateOrderByOrderId,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  deleteOrderById,
};
