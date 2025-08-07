const express = require("express");
const router = express.Router();
const encrypt = require("../utils/ccAvenue");
const { merchantId, accessCode, workingKey, redirectUrl, cancelUrl } = require("../config/ccavenueConfig");

router.post("/initiate", async (req, res) => {
  const {
    orderId,
    amount,
    currency = "INR",
    billing_name,
    billing_email,
    billing_tel,
    billing_address,
    billing_city,
    billing_state,
    billing_zip,
    billing_country,
  } = req.body;

  const formData = `merchant_id=${merchantId}&order_id=${orderId}&currency=${currency}&amount=${amount}&redirect_url=${redirectUrl}&cancel_url=${cancelUrl}&language=EN&billing_name=${billing_name}&billing_address=${billing_address}&billing_city=${billing_city}&billing_state=${billing_state}&billing_zip=${billing_zip}&billing_country=${billing_country}&billing_tel=${billing_tel}&billing_email=${billing_email}`;
console.log("Form Data:", formData);
  const encRequest = encrypt(formData, workingKey);
console.log("encRequest", encRequest);
  return res.json({
    encRequest,
    accessCode,
  });   
});

module.exports = router;