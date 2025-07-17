// utils/generateLabel.js
const axios = require("axios");

const generateDTDCLabel = async (referenceNumber) => {
  const response = await axios.get(
    "https://dtdcapi.shipsy.io/api/customer/integration/consignment/shippinglabel/stream",
    {
      headers: { "api-key": process.env.DTDC_API_KEY },
      params: {
        reference_number: referenceNumber,
        label_code: "SHIP_LABEL_4X6",
        label_format: "base64"
      }
    }
  );

  return response.data.label;
};

module.exports = generateDTDCLabel;
