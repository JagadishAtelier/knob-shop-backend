
const express = require("express");
const router = express.Router();
const { createOrderWithShipping,getAllOrders,getOrderById,deleteOrderById,updateOrderByOrderId,getOrdersByUserId,getUnseenOrders,markOrderAsSeen  } = require("../controllers/orderController");

router.post("/", createOrderWithShipping);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:orderId", updateOrderByOrderId);
router.get("/user/:userId", getOrdersByUserId);
router.delete("/:id", deleteOrderById);

// Notification routes
router.get("/notifications/unseen", getUnseenOrders);      // fetch unseen orders
router.put("/notifications/:orderId/seen", markOrderAsSeen); // mark as seen
module.exports = router;
