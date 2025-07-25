
const express = require("express");
const router = express.Router();
const { createOrderWithShipping,getAllOrders,getOrderById } = require("../controllers/orderController");

router.post("/", createOrderWithShipping);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);

module.exports = router;
