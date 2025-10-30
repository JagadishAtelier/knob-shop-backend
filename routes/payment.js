const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("querystring");
const ccAvenue = require("../utils/ccAvenue");
const Order = require("../models/Order");
const {
  merchantId,
  accessCode,
  workingKey,
  redirectUrl,
  cancelUrl,
} = require("../config/ccavenueConfig");

// 🟢 INITIATE PAYMENT
router.post("/initiate", async (req, res) => {
  try {
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

    const formData = `merchant_id=${encodeURIComponent(
      merchantId
    )}&order_id=${encodeURIComponent(orderId)}&currency=${encodeURIComponent(
      currency
    )}&amount=${encodeURIComponent(amount)}&redirect_url=${encodeURIComponent(
      redirectUrl
    )}&cancel_url=${encodeURIComponent(
      cancelUrl
    )}&language=EN&billing_name=${encodeURIComponent(
      billing_name
    )}&billing_address=${encodeURIComponent(
      billing_address
    )}&billing_city=${encodeURIComponent(
      billing_city
    )}&billing_state=${encodeURIComponent(
      billing_state
    )}&billing_zip=${encodeURIComponent(
      billing_zip
    )}&billing_country=${encodeURIComponent(
      billing_country
    )}&billing_tel=${encodeURIComponent(
      billing_tel
    )}&billing_email=${encodeURIComponent(billing_email)}`;

    const encRequest = ccAvenue.encrypt(formData, workingKey);
    return res.json({
      encRequest,
      accessCode,
      merchantId,
    });
  } catch (error) {
    console.error("❌ Error initiating payment:", error);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
});

// 🟡 PAYMENT RESPONSE
router.post("/payment-response", async (req, res) => {
  try {
    const encryptedResponse = req.body;

    if (!encryptedResponse) {
      return res.status(400).send("No encResp received");
    }

    const decrypted = ccAvenue.decrypt(encryptedResponse.encResp, workingKey);
    const parsed = Object.fromEntries(new URLSearchParams(decrypted));

    console.log("🔔 Payment response decrypted:", parsed);

    const orderId = parsed.order_id;
    const paymentStatus = parsed.order_status;

    if (!orderId) {
      console.error("No order_id found in payment response");
      return res.status(400).send("Missing order_id in payment response");
    }

    const updateFields = {
      paymentStatus: paymentStatus.toLowerCase(),
      status: paymentStatus === "Success" ? "confirmed" : "pending",
      paymentReference: parsed.tracking_id || parsed.bank_ref_no || "",
    };

    await Order.findOneAndUpdate({ orderId }, updateFields, { new: true });

    if (paymentStatus === "Success") {
      return res.redirect(
        `https://knobsshop.store/order-confirmed?order_id=${orderId}`
      );
    } else {
      return res.redirect(
        `https://knobsshop.store/payment-failed?order_id=${orderId}`
      );
    }
  } catch (error) {
    console.error("Error handling payment response:", error);
    return res.status(500).send("Internal server error");
  }
});

// 🔴 PAYMENT CANCELLED
router.post("/payment-cancelled", (req, res) => {
  const encryptedResponse = req.body.encResp;
  console.log("🔔 Payment cancelled:", encryptedResponse);
  return res.redirect(`https://knobsshop.store/payment-failed`);
});

// 🧾 FETCH ALL PAYMENTS (CCAvenue List)
router.get("/list", async (req, res) => {
  try {
    let { from, to, page = 1 } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ success: false, message: "Invalid page number" });
    }

    // ✅ Format dates for CCAvenue (DD/MM/YYYY)
    const formatDate = (d) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    const endDate = to ? new Date(to) : new Date();
    const startDate = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const query = `merchant_id=${merchantId}&from_date=${formatDate(startDate)}&to_date=${formatDate(endDate)}&page_no=${page}`;
    const encRequest = ccAvenue.encrypt(query, workingKey);

    const payload = qs.stringify({
      enc_request: encRequest,
      access_code: accessCode,
      command: "getOrderList",
      request_type: "JSON",
      version: "1.1",
    });

    const response = await axios.post(
      "https://api.ccavenue.com/apis/servlet/DoWebTrans",
      payload,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const raw = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    if (raw.includes("Invalid Parameter")) {
      console.error("❌ Invalid parameter in CCAvenue request:", raw);
      return res.status(400).json({
        success: false,
        message: "Invalid parameter sent to CCAvenue",
        raw,
      });
    }

    const encryptedResponse = response.data.enc_response || response.data;
    if (!encryptedResponse) {
      return res.status(502).json({
        success: false,
        message: "CCAvenue returned no encrypted data",
        raw: response.data,
      });
    }

    let decrypted;
    try {
      decrypted = ccAvenue.decrypt(encryptedResponse, workingKey);
    } catch (err) {
      console.error("❌ Decryption failed:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to decrypt CCAvenue response",
        raw: encryptedResponse,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(decrypted);
    } catch (err) {
      console.warn("⚠️ Non-JSON response from CCAvenue:", decrypted);
      return res.json({ success: true, decrypted });
    }

    res.json({
      success: true,
      range: { from: formatDate(startDate), to: formatDate(endDate) },
      total_records: parsed.total_records || parsed.orders?.length || 0,
      data: parsed.orders || [],
    });
  } catch (error) {
    console.error("❌ Uncaught Error fetching payment list:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



// 🔍 SINGLE PAYMENT DETAILS
router.get("/details/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const query = `merchant_id=${merchantId}&order_no=${orderId}`;
    const encRequest = ccAvenue.encrypt(query, workingKey);

    const response = await axios.post(
      "https://api.ccavenue.com/apis/servlet/DoWebTrans",
      qs.stringify({
        enc_request: encRequest,
        access_code: accessCode,
        command: "orderStatusTracker",
        request_type: "JSON",
        version: "1.1",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const decrypted = ccAvenue.decrypt(response.data, workingKey);
    const parsed = JSON.parse(decrypted);

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("❌ Error fetching payment details:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment details" });
  }
});

// 💸 REFUND API
router.post("/refund", async (req, res) => {
  try {
    const { orderId, refundAmount, refundReason } = req.body;

    if (!orderId || !refundAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and refund amount required" });
    }

    const order = await Order.findOne({ orderId });
    if (!order || !order.paymentReference) {
      return res
        .status(404)
        .json({ success: false, message: "Order or payment reference not found" });
    }

    const refundData = `reference_no=${order.paymentReference}&refund_amount=${refundAmount}&refund_ref_no=REF_${Date.now()}&refund_reason=${encodeURIComponent(
      refundReason || "Customer requested refund"
    )}`;
    const encRequest = ccAvenue.encrypt(refundData, workingKey);

    const response = await axios.post(
      "https://api.ccavenue.com/apis/servlet/DoWebTrans",
      qs.stringify({
        enc_request: encRequest,
        access_code: accessCode,
        command: "refundOrder",
        request_type: "JSON",
        version: "1.1",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const decrypted = ccAvenue.decrypt(response.data, workingKey);
    const parsed = JSON.parse(decrypted);

    await Order.findOneAndUpdate(
      { orderId },
      { refundStatus: parsed.status, refundDetails: parsed },
      { new: true }
    );

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("❌ Refund API error:", error.message);
    res.status(500).json({ success: false, message: "Refund failed" });
  }
});

module.exports = router;
