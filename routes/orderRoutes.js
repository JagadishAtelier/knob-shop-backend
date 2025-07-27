
const express = require("express");
const router = express.Router();
const { createOrderWithShipping,getAllOrders,getOrderById,deleteOrderById } = require("../controllers/orderController");

router.post("/", createOrderWithShipping);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrderById);

module.exports = router;
