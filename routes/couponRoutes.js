// routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const { createCoupon, validateCoupon, markCouponUsed,getAvailableCoupons } = require("../controllers/couponController");
const { Frontprotect } = require("../middlewares/authMiddleware");

// Admin route to create coupon
router.post("/", Frontprotect, /* adminCheck, */ createCoupon);

// User route to validate coupon before payment
router.post("/validate", Frontprotect, validateCoupon);

// After successful payment, mark coupon as used
router.post("/mark-used", Frontprotect, markCouponUsed);

router.get("/available", Frontprotect, getAvailableCoupons);


module.exports = router;
