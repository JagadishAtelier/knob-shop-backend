const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require('./routes/reviewRoutes');
const adminReviewRoutes = require('./routes/adminReviewRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// health check
app.get("/api/status", (req, res) => {
  res.status(200).json({
    message: "Knobs Shop API is running ✅",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/auth", require("./routes/authRoutes"));
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Knobs Shop API</title>
      <style>
        body {
          font-family: sans-serif;
          background: #f9f9f9;
          color: #333;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        h1 {
          color: #2b6cb0;
        }
        p {
          margin-top: 10px;
        }
        a {
          color: #3182ce;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Knobs Shop API</h1>
      <p>This is the backend for the Knobs Shop eCommerce platform.</p>
      <p>Check API health at <a href="/api/status">/api/status</a></p>
    </body>
    </html>
  `);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
