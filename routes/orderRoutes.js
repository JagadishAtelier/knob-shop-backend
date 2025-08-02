
const express = require("express");
const router = express.Router();
const { createOrderWithShipping,getAllOrders,getOrderById,deleteOrderById,createOnlyConsignment } = require("../controllers/orderController");

router.post("/", createOrderWithShipping);
router.post("/only", createOnlyConsignment);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrderById);
module.exports = router;
