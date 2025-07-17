// controllers/order.controller.js
const Order = require("../models/Order");
const createDTDCConsignment = require("../utils/createConsignment");
const generateDTDCLabel = require("../utils/generateLabel");

const createOrderWithShipping = async (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = new Order(orderData);
    await newOrder.save();

    const dtdcResponse = await createDTDCConsignment(orderData);
    const referenceNumber = dtdcResponse.reference_number;

    const base64Label = await generateDTDCLabel(referenceNumber);

    newOrder.dtdcReferenceNumber = referenceNumber;
    newOrder.shippingLabelBase64 = base64Label;
    newOrder.labelGenerated = true;
    await newOrder.save();

    res.status(200).json({ message:"Order and shipping label created", order: newOrder })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order creation failed", error: error.message })
  }
};

module.exports = { createOrderWithShipping };
