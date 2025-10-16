const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorHandler");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require('./routes/productReviewRoute');
const adminReviewRoutes = require('./routes/adminReviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require("./routes/authRoutes");
const frontauth = require("./routes/Frontauth");
const paymentRouter = require("./routes/payment");
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const policyRoutes = require('./routes/policyRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adRoutes = require('./routes/adRoutes');
const wishlistRoutes= require('./routes/wishlistRoutes');
const analyticRoutes = require('./routes/AnalyticRoutes');
const brochureRoutes = require("./routes/BroucherRouter");
const couponRoutes = require('./routes/couponRoutes');
const essentialsRoutes = require('./routes/essentialsRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const shelfRoutes = require("./routes/shelfRoutes");
const trackingRoutes = require("./routes/tracking");
dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// health check
app.get("/api/status", (req, res) => {
  res.status(200).json({
    message: "Knobs Shop API is running ✅",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/auth",authRoutes);
app.use("/api/payment",paymentRouter);
app.use("/api/user/auth", frontauth);
app.use('/api/address', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use("/api/essentials", essentialsRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ad', adRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/analytic', analyticRoutes);
app.use("/api/brochures", brochureRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/shelves", shelfRoutes);
app.use("/api/track", trackingRoutes);
app.use('/api', consultationRoutes);
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

const http = require("http");
const { init } = require("./socket");

const server = http.createServer(app);
init(server);

// app.listen(PORT, () => console.log(`Server running on port crtl + click this url http://localhost:${PORT} access swagger docs url http://localhost:${PORT}/api-docs`));
server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port http://localhost:${PORT}\n` +
    `📖 Swagger docs: http://localhost:${PORT}/api-docs`
  );
});
