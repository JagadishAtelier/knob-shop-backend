// utils/generateLabel.js
const axios = require("axios");

const streamDTDCLabelToRes = async (referenceNumber, res) => {
  try {
    const labelStream = await axios.get(
      "https://alphademodashboardapi.shipsy.io/api/customer/integration/consignment/shippinglabel/stream",
      {
        headers: {
          "api-key": process.env.DTDC_API_KEY,
        },
        params: {
          reference_number: referenceNumber,
          label_code: "SHIP_LABEL_A4",
          label_format: "pdf",
        },
        responseType: "arraybuffer",
      }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=label.pdf");
    res.send(labelStream.data);
  } catch (error) {
    console.error("Label preview error:", error?.response?.data || error.message);
    res.status(500).json({
      message: "Failed to stream DTDC label",
      error: error?.response?.data || error.message,
    });
  }
};

module.exports = { streamDTDCLabelToRes };
