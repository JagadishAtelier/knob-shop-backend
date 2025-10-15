// controllers/order.controller.js
const Order = require("../models/Order");
const User = require("../models/FrontUser");
const Address = require("../models/userAddress");
const Coupon = require("../models/Coupon");
const { getIO } = require("../socket");
const normalize = (str) => str?.trim().toLowerCase();
const createOrderWithShipping = async (req, res) => {
  try {
    const orderData = req.body;
    console.log("Order Data:", orderData);

    if (!orderData.userId || !orderData.items?.length) {
      return res.status(400).json({ message: "Missing required order data" });
    }

    // 🧮 Step 1: Calculate subtotal
    orderData.items.forEach((item) => {
      item.total = item.quantity * item.price;
    });
    const subtotal = orderData.items.reduce((sum, i) => sum + i.total, 0);

    let discountAmount = 0;
    let couponUsed = null;

    // 🎟️ Step 2: Handle coupon if provided
    if (orderData.couponCode) {
      const code = orderData.couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code });

      if (!coupon)
        return res.status(400).json({ message: "Invalid coupon code" });

      // Validate coupon status and date
      const now = new Date();
      if (!coupon.isActive || now < coupon.startDate || now > coupon.expiryDate)
        return res
          .status(400)
          .json({ message: "Coupon is expired or not active" });

      // Validate product scope
      if (coupon.appliesTo === "single") {
        const hasMatchingProduct = orderData.items.some(
          (i) => i.productId?.toString() === coupon.productId?.toString()
        );
        if (!hasMatchingProduct) {
          return res.status(400).json({
            message: "This coupon is valid only for a specific product",
          });
        }
      }

      // 💰 Step 3: Calculate discount
      if (coupon.type === "flat") {
        discountAmount = coupon.value;
      } else if (coupon.type === "percentage") {
        discountAmount = (subtotal * coupon.value) / 100;
      }

      // Prevent over-discounting
      discountAmount = Math.min(discountAmount, subtotal);
      couponUsed = coupon.code;
    }

    // 💵 Step 4: Final totals
    const finalAmount = subtotal - discountAmount;

    orderData.totalAmount = subtotal;
    orderData.discountAmount = discountAmount;
    orderData.finalAmount = finalAmount;
    orderData.couponCode = couponUsed;

    // 🧾 Optional business info
    orderData.gstNumber = orderData.gstNumber?.trim() || null;
    orderData.companyName = orderData.companyName?.trim() || null;

    // 🛒 Step 5: Save order
    const newOrder = new Order(orderData);
    await newOrder.save();

    // 👤 Step 6: Update user GST/company/address
    if (orderData.userId) {
      const user = await User.findById(orderData.userId).populate("address");
      let userUpdated = false;

      if (orderData.gstNumber) {
        user.GST = orderData.gstNumber;
        userUpdated = true;
      }
      if (orderData.companyName) {
        user.company = orderData.companyName;
        userUpdated = true;
      }
      if (userUpdated) await user.save();

      if (orderData.shippingAddress) {
        const existingAddress = user?.address;
        const isSame =
          existingAddress &&
          normalize(existingAddress.phone) ===
            normalize(orderData.shippingAddress.phone) &&
          normalize(existingAddress.street) ===
            normalize(orderData.shippingAddress.street) &&
          normalize(existingAddress.city) ===
            normalize(orderData.shippingAddress.city) &&
          normalize(existingAddress.pincode) ===
            normalize(orderData.shippingAddress.pincode) &&
          normalize(existingAddress.state) ===
            normalize(orderData.shippingAddress.state);

        if (!isSame) {
          const newAddress = new Address({
            ...orderData.shippingAddress,
            userId: orderData.userId,
          });
          await newAddress.save();
          user.address = newAddress._id;
          await user.save();
        }
      }
    }

    // 🔔 Step 7: Emit socket event
    getIO().emit("newOrder", {
      message: "📦 New Order Placed!",
      orderId: newOrder._id,
      totalAmount: newOrder.finalAmount,
      userId: newOrder.userId,
      createdAt: newOrder.createdAt,
    });

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message,
    });
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
    res.status(500).json({
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
    res.status(500).json({
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

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
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
    const { orderId } = req.params; // This is the MongoDB _id from frontend

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID (_id) is required",
      });
    }

    const updates = req.body;

    // ✅ Restrict updates to allowed fields
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

    // ✅ Use findByIdAndUpdate to match MongoDB _id
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found with given _id",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const totalCount = await Order.countDocuments({ userId });

    const orders = await Order.find({ userId })
      .populate("userId", "name email")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      orders,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching orders by userId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// GET /api/admin/notifications
const getUnseenOrders = async (req, res) => {
  try {
    const unseenOrders = await Order.find({ seenByAdmin: false }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, orders: unseenOrders });
  } catch (err) {
    console.error("Error fetching unseen orders:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch unseen orders",
        error: err.message,
      });
  }
};

// Mark order as seen
const markOrderAsSeen = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { seenByAdmin: true },
      { new: true }
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Error marking order as seen:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update order",
        error: err.message,
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
  getUnseenOrders,
  markOrderAsSeen,
};
