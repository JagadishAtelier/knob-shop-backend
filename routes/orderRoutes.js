
const express = require("express");
const router = express.Router();
const { createOrderWithShipping } = require("../controllers/orderController");

router.post("/orders", createOrderWithShipping);

module.exports = router;
