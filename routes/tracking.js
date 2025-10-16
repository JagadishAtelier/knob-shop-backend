const express = require("express");
const axios = require("axios");

const router = express.Router();

const TRACKING_URL = "https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails";
const DTDC_TOKEN = "EO2159_trk_json:15ee71a2320ae7fcc0fea5f396dd58d6";

router.post("/track-shipment", async (req, res) => {
  const { consignmentNumber } = req.body;
  if (!consignmentNumber) {
    return res.status(400).json({ error: "Missing consignment number" });
  }

  try {
    const { data } = await axios.post(
      TRACKING_URL,
      {
        trkType: "cnno",
        strcnno: consignmentNumber,
        addtnlDtl: "Y",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-access-token": DTDC_TOKEN,
          "Cookie":
            "JSESSIONID=A073FD5B5A06B0CAEC8B9583643D5A41; cookiesession1=678A3F3D4DCAD2C68870A722D5E853D5",
        },
      }
    );

    res.json(data);
  } catch (err) {
    console.error("DTDC API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Tracking request failed" });
  }
});

module.exports = router;
