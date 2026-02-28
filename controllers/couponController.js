const Coupon = require("../models/Coupon");
const User = require("../models/FrontUser");
const Order = require("../models/Order");

exports.validateCoupon = async (req, res) => {
  try {
    const { userId, couponCode } = req.body;

    if (!userId || !couponCode) {
      return res
        .status(400)
        .json({ message: "User ID and coupon code are required" });
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.usedCoupons.includes(couponCode.toUpperCase())) {
      return res.status(400).json({ message: "Coupon already used" });
    }

    // Special logic for KNOBSSHOP25: Only new users (0 past orders)
    if (couponCode.toUpperCase() === "KNOBSSHOP25") {
      const pastOrders = await Order.countDocuments({ userId: userId });
      if (pastOrders > 0) {
        return res.status(400).json({ message: "This coupon is only valid for new users on their first order" });
      }
    }

    // user.usedCoupons.push(couponCode.toUpperCase());
    // await user.save();

    res.json({
      message: "Coupon applied successfully",
      discount: coupon.value,
      type: coupon.type,
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      expiryDate,
      scheduled,
      startDate,
      appliesTo,
      productId,
    } = req.body;

    // Basic validation
    if (!code || !type || !value || !expiryDate || !startDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Optional validation for single product coupons
    if (appliesTo === "single" && !productId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Product ID is required for single-product coupons",
        });
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      startDate,
      expiryDate,
      // Set isActive based on whether the coupon is scheduled
      isActive: !scheduled,
      appliesTo,
      // Set productId only if the coupon applies to a single product
      productId: appliesTo === "single" ? productId : null,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Auto-update isActive based on startDate + expiryDate
    if (updateData.startDate || updateData.expiryDate) {
      const now = new Date();
      const startDate = new Date(updateData.startDate || now);
      const expiryDate = new Date(updateData.expiryDate || now);

      updateData.isActive = startDate <= now && expiryDate >= now;
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.markCouponUsed = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon" });
    }

    if (!coupon.usedBy.includes(userId)) {
      coupon.usedBy.push(userId);
      await coupon.save();
    }

    res.json({ success: true, message: "Coupon marked as used" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user._id; // comes from auth middleware
    // or from req.user if using auth middleware

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch coupons that:
    // 1. Are active
    // 2. Have not expired
    // 3. Have not been used by the user
    const today = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: today },
      code: { $nin: user.usedCoupons }, // exclude already used coupons
    }).lean();

    res.json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    if (!res) {
      return res.status(404).json({ message: "Coupons not found" });
    }
    res.json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the coupon by its ID
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAllofferProducts = async (req, res) => {
  try {
    // Find active coupons that apply to a single product
    const coupons = await Coupon.find({
      appliesTo: "single",
      isActive: true,
      startDate: { $lte: new Date() },
      expiryDate: { $gte: new Date() },
      productId: { $ne: null },
    }).populate("productId");

    if (!coupons.length) {
      return res.status(404).json({ message: "No active single-product coupons found" });
    }

    // Extract the products
    const products = coupons.map(c => ({
      couponCode: c.code,
      discountType: c.type,
      discountValue: c.value,
      product: c.productId,
    }));

    res.json({ products });
  } catch (error) {
    console.error("Error fetching active coupon products:", error);
    res.status(500).json({ error: "Server error" });
  }
};