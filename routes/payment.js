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

  const formData = `merchant_id=${encodeURIComponent(merchantId)}&order_id=${encodeURIComponent(orderId)}&currency=${encodeURIComponent(currency)}&amount=${encodeURIComponent(amount)}&redirect_url=${encodeURIComponent(redirectUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&language=EN&billing_name=${encodeURIComponent(billing_name)}&billing_address=${encodeURIComponent(billing_address)}&billing_city=${encodeURIComponent(billing_city)}&billing_state=${encodeURIComponent(billing_state)}&billing_zip=${encodeURIComponent(billing_zip)}&billing_country=${encodeURIComponent(billing_country)}&billing_tel=${encodeURIComponent(billing_tel)}&billing_email=${encodeURIComponent(billing_email)}`;

console.log("Form Data:", formData);
  const encRequest = encrypt(formData, workingKey);
console.log("encRequest", encRequest);
  return res.json({
    encRequest,
    accessCode,
  });   
});

module.exports = router;