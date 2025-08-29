// routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const { createCoupon, validateCoupon, markCouponUsed,getAvailableCoupons,getAllCoupons,deleteCoupon,updateCoupon } = require("../controllers/couponController");
const { Frontprotect,protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

// Admin route to create coupon
router.post("/", protect, adminOnly,  createCoupon);
router.put("/update/:id", protect, adminOnly,  updateCoupon);

// User route to validate coupon before payment
router.post("/validate", Frontprotect, validateCoupon);

// After successful payment, mark coupon as used
router.post("/mark-used", Frontprotect, markCouponUsed);
router.delete("/:id", deleteCoupon);
router.get("/available", Frontprotect, getAvailableCoupons);
router.get("/", getAllCoupons);


module.exports = router;
