const axios = require('axios');
const fs = require('fs');

const generateDTDCLabel = async (referenceNumber) => {
  try {
    const response = await axios.get(
      "https://alphademodashboardapi.shipsy.io/api/customer/integration/consignment/shippinglabel/stream",
      {
        headers: {
          "api-key": process.env.DTDC_API_KEY
        },
        params: {
          reference_number: referenceNumber,
          label_code: "SHIP_LABEL_A4",  // or SHIP_LABEL_4X6
          label_format: "pdf"           // or "base64" for inline use
        },
        responseType: "arraybuffer" // very important for binary (PDF)
      }
    );

    // Save or return PDF
    fs.writeFileSync("dtdc_label.pdf", response.data);
    console.log("✅ Label downloaded and saved as dtdc_label.pdf");
  } catch (error) {
    console.error("❌ Failed to fetch label:", error?.response?.data || error.message);
  }
};
module.exports = generateDTDCLabel;