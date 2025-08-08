
const express = require("express");
const router = express.Router();
const { createOrderWithShipping,getAllOrders,getOrderById,deleteOrderById,updateOrderByOrderId,getOrdersByUserId } = require("../controllers/orderController");

router.post("/", createOrderWithShipping);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:orderId", updateOrderByOrderId);
router.get("/user/:userId", getOrdersByUserId);
router.delete("/:id", deleteOrderById);
module.exports = router;
