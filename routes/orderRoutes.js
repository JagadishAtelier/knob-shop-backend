
const express = require("express");
const router = express.Router();
const { createOrderWithShipping } = require("../controllers/orderController");

router.post("/", createOrderWithShipping);

module.exports = router;
