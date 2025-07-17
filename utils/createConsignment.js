const axios = require("axios");

const createDTDCConsignment = async (orderData) => {
  try {
    const payload = {
      consignments: [
        {
          customer_code: process.env.DTDC_CUSTOMER_CODE,
          service_type_id: "B2C PRIORITY",
          load_type: "NON-DOCUMENT",
          description: "Order items",
          dimension_unit: "cm",
          length: "30", width: "30", height: "30",
          weight_unit: "kg",
          weight: "1.0",
          declared_value: orderData.totalAmount,
          num_pieces: "1",
          origin_details: {
            name: "Your Company",
            phone: "9999999999",
            address_line_1: "123 Main Street",
            pincode: "110001",
            city: "New Delhi",
            state: "Delhi"
          },
          destination_details: {
            name: orderData.shippingAddress.name,
            phone: orderData.shippingAddress.phone,
            address_line_1: orderData.shippingAddress.street,
            pincode: orderData.shippingAddress.pincode,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state
          },
          return_details: {
            name: "Return Dept",
            phone: "9999999999",
            address_line_1: "123 Main Street",
            city_name: "New Delhi",
            pincode: "110001",
            state_name: "Delhi",
            email: "support@yourcompany.com"
          },
          customer_reference_number: orderData._id, // internal order ID
          cod_collection_mode: "",
          cod_amount: "",
          commodity_id: "99",
          eway_bill: "",
          is_risk_surcharge_applicable: "false",
          invoice_number: orderData.invoiceNo || "INV123",
          invoice_date: orderData.invoiceDate || new Date().toISOString().split('T')[0],
        }
      ]
    };

    const response = await axios.post(
      "https://dtdcapi.shipsy.io/api/customer/integration/consignment/softdata",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.DTDC_API_KEY,
        },
      }
    );

    return response.data.data[0];
  } catch (error) {
    console.error("DTDC Consignment Error:", error?.response?.data || error.message);
    throw new Error("Failed to create DTDC consignment");
  }
};

module.exports = createDTDCConsignment;
