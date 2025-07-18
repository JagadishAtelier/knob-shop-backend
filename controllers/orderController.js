// controllers/order.controller.js
const Order = require("../models/Order");
const User = require("../models/User");
const Address = require("../models/userAddress");
const createDTDCConsignment = require("../utils/createConsignment");
const generateDTDCLabel = require("../utils/generateLabel");
const normalize = (str) => str?.trim().toLowerCase();
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

    if (orderData.userId && orderData.shippingAddress) {
      const user = await User.findById(orderData.userId).populate('address');
      const existingAddress = user.address;

      const isSameAddress =
        existingAddress &&
        normalize(existingAddress.phone) === normalize(orderData.shippingAddress.phone) &&
        normalize(existingAddress.street) === normalize(orderData.shippingAddress.street) &&
        normalize(existingAddress.city) === normalize(orderData.shippingAddress.city) &&
        normalize(existingAddress.district) === normalize(orderData.shippingAddress.district) &&
        normalize(existingAddress.pincode) === normalize(orderData.shippingAddress.pincode) &&
        normalize(existingAddress.state) === normalize(orderData.shippingAddress.state);

      if (!isSameAddress) {
        const newAddress = new Address(orderData.shippingAddress);
        await newAddress.save();

        user.address = newAddress._id;
        await user.save();
      }
    }
    res.status(200).json({ message:"Order and shipping label created", order: newOrder })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order creation failed", error: error.message })
  }
};

module.exports = { createOrderWithShipping };
