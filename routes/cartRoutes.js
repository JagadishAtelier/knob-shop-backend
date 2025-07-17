const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartByUserId,
  deleteCartItem
} = require("../controllers/cartController");

router.post("/add", addToCart);

router.get("/get/:userId", getCartByUserId);

router.delete("/delete/:id", deleteCartItem);

module.exports = router;
