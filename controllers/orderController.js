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

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item"});
    }

    orderData.items.forEach(item =>{
      item.total = item.quantity * item.price
    })

    orderData.totalAmount = orderData.items.reduce((sum,item) => sum + item.total,0)


    const dtdcResponse = await createDTDCConsignment(orderData);
    // const referenceNumber = dtdcResponse.reference_number;
    // const base64Label = await generateDTDCLabel(referenceNumber);

    // orderData.dtdcReferenceNumber = referenceNumber;
    // orderData.shippingLabelBase64 = base64Label;
    // orderData.labelGenerated = true;

    const newOrder = new Order(orderData);
    await newOrder.save();

    if (orderData.userId && orderData.shippingAddress) {
      const user = await User.findById(orderData.userId).populate('address');
      const existingAddress = user?.address;

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
    res.status(500).json({ message:"Order creation failed", error: error.message })
  }
};
const createOnlyConsignment = async (req, res) => {
  try {
    const orderData = req.body;

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ message: "Consignment must contain at least one item" });
    }

    orderData.items.forEach(item => {
      item.total = item.quantity * item.price;
    });

    orderData.totalAmount = orderData.items.reduce((sum, item) => sum + item.total, 0);

    const dtdcResponse = await createDTDCConsignment(orderData);

    if (!dtdcResponse.success || !dtdcResponse.reference_number) {
      return res.status(400).json({
        message: "DTDC consignment creation failed",
        error: dtdcResponse.message || "Unknown error from DTDC"
      });
    }

    // 🔥 Generate label
    const referenceNumber = dtdcResponse.reference_number;
    const base64Label = await generateDTDCLabel(referenceNumber);

    res.status(200).json({
      message: "DTDC consignment created and label generated successfully",
      consignment: dtdcResponse,
      shippingLabelBase64: base64Label
    });
  } catch (error) {
    console.error("Consignment creation error:", error);
    res.status(500).json({
      message: "Failed to create DTDC consignment or generate label",
      error: error.message
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email") // Populate user info if needed
      .populate("items.productId")      // Populate product details if productId exists
      .sort({ createdAt: -1 });         // Optional: show latest orders first

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order", error: error.message });
  }
};

// Delete an order by ID
const deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted successfully", deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order", error: error.message });
  }
};




module.exports = { createOrderWithShipping,getAllOrders,getOrderById,deleteOrderById,createOnlyConsignment };
