const AnalyticsSnapshot = require("../models/AnalyticsModel");
const Order = require("../models/Order");
const User = require("../models/User");
const FrontUser = require("../models/FrontUser");
const Product = require("../models/Product");

const getMonthName = (i) =>
  new Date(0, i).toLocaleString("default", { month: "short" });

// 📌 Generate analytics snapshot
exports.generateAnalyticsSnapshot = async (req, res) => {
  try {
    const orders = await Order.find({});
    const users = await FrontUser.find({});
    const products = await Product.find({});

    // ✅ Total Sales (all placed orders except cancelled)
    const totalSales = orders.reduce(
      (acc, order) => (order.status !== "cancelled" ? acc + (order.totalAmount || 0) : acc),
      0
    );

// ✅ Dynamic metrics

// 1️⃣ Total Products Sold
const totalProductsSold = orders.reduce((acc, order) => {
  if (order.status !== "cancelled") {
    return acc + order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
  return acc;
}, 0);

// 2️⃣ Average Order Value
const averageOrderValue = orders.length
  ? totalSales / orders.length
  : 0;

// 3️⃣ Average Revenue per Customer
const customerRevenueMap = {};
orders.forEach((order) => {
  if (order.status !== "cancelled" && order.userId) {
    const key = order.userId.toString();
    customerRevenueMap[key] = (customerRevenueMap[key] || 0) + order.totalAmount;
  }
});
const averageRevenuePerCustomer = Object.keys(customerRevenueMap).length
  ? Object.values(customerRevenueMap).reduce((a, b) => a + b, 0) / Object.keys(customerRevenueMap).length
  : 0;


    // ✅ Monthly sales (Jan - Dec)
    const monthlySales = Array(12).fill(0).map((_, i) => ({
      month: getMonthName(i),
      totalSales: 0,
    }));

    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        const month = new Date(order.createdAt).getMonth();
        monthlySales[month].totalSales += order.totalAmount;
      }
    });

    // ✅ Weekly sales (last 7 days)
    const now = new Date();
    const weeklySales = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      return {
        day: d.toLocaleString("default", { weekday: "short" }),
        totalSales: 0,
      };
    }).reverse();

    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        const dayIndex = (now.getDay() - new Date(order.createdAt).getDay() + 7) % 7;
        if (weeklySales[dayIndex]) {
          weeklySales[dayIndex].totalSales += order.totalAmount;
        }
      }
    });

    // ✅ Yearly sales
    const yearlySales = {};
    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        const year = new Date(order.createdAt).getFullYear();
        yearlySales[year] = (yearlySales[year] || 0) + order.totalAmount;
      }
    });

    // ✅ Order Status Summary
    const orderStatusSummary = {
      success: orders.filter((o) => o.status === "delivered").length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };

    // ✅ Top Selling Products

// ✅ Top Selling Products
// ✅ Top Selling Products
const productSalesMap = {}; // Initialize map

for (const order of orders) {
  if (order.status !== "cancelled") {
    for (const item of order.items) {
      // Fetch the actual product using productId from order
      const product =
        await Product.findOne({ _id: item.productId }) ||
        await Product.findOne({ productId: item.productId.toString() });

      if (!product) {
        console.log("Missing product for keyId:", item.productId);
        continue; // skip if product not found
      }

      const key = product._id.toString(); // Use actual MongoDB _id as key
      console.log("key Id :", key);

      if (!productSalesMap[key]) {
        productSalesMap[key] = { soldQty: 0, revenue: 0 };
      }

      productSalesMap[key].soldQty += item.quantity;
      productSalesMap[key].revenue += item.quantity * item.price;
    }
  }
}

// Sort products by sold quantity
const sortedProductIds = Object.entries(productSalesMap).sort(
  (a, b) => b[1].soldQty - a[1].soldQty
);

// Build top-selling products array
const topSellingProducts = [];
for (const [productId, stats] of sortedProductIds.slice(0, 3)) {
  const product = await Product.findById(productId);
  if (product) {
    const price =
      product.variant?.[0]?.sizes?.[0]?.sellingPrice || product.price || 0;

    topSellingProducts.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || null,
      price,
      soldQty: stats.soldQty,
      revenue: stats.revenue,
      changeRate: Math.floor(Math.random() * 30),
    });
  } else {
    console.log("Missing product for keyId:", productId);
  }
}





    // ✅ Customers count
    const customerIds = [...new Set(orders.map((o) => o.userId?.toString()))].filter(Boolean);
    const totalCustomers = customerIds.length;
    const totalUsers = users.length;

    // ✅ New customers (last 7 days)
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const newCustomers = await FrontUser.countDocuments({ createdAt: { $gte: oneWeekAgo } });

    const analytics = new AnalyticsSnapshot({
      totalSales,
      monthlySales,
      weeklySales,
      yearlySales,
      totalOrders: orders.length,
      totalCustomers,
      totalUsers,
      newCustomers,
      orderStatusSummary,
      topSellingProducts,
      customerSatisfaction: {
        averageRating: 4.6,
        positiveFeedbacks: 340,
        negativeFeedbacks: 22,
      },
      totalProductsSold,
      averageOrderValue,
      averageRevenuePerCustomer,
    });

    await analytics.save();
    res.status(201).json({ message: "Analytics snapshot created", analytics });
  } catch (err) {
    console.error("Analytics generation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// 📌 Get latest analytics snapshot (Dynamic: Daily, Weekly, Monthly, Yearly)
// 📌 Get latest analytics snapshot (Dynamic: Daily, Weekly, Monthly, Yearly)
exports.getLatestAnalyticsSnapshot = async (req, res) => {
  try {
    const { range = "Weekly" } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (range === "Daily") startDate.setDate(now.getDate() - 1);
    else if (range === "Weekly") startDate.setDate(now.getDate() - 7);
    else if (range === "Monthly") startDate.setMonth(now.getMonth() - 1);
    else if (range === "Yearly") startDate.setFullYear(now.getFullYear() - 1);

    const orders = await Order.find({ createdAt: { $gte: startDate } });
    const users = await FrontUser.find({ createdAt: { $gte: startDate } });

    // ✅ Total sales for all placed (non-cancelled) orders
    const totalSales = orders.reduce(
      (acc, order) =>
        (order.status == "confirmed" && order.paymentStatus == "success") ? acc + (order.totalAmount || 0) : acc,
      0
    );

    // ✅ Total Products Sold
const totalProductsSold = orders.reduce((acc, order) => {
  if (order.status == "confirmed" && order.paymentStatus == "success") {
    return acc + order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
  return acc;
}, 0);

// ✅ Average Order Value
const averageOrderValue = orders.length
  ? totalSales / orders.length
  : 0;

// ✅ Average Revenue per Customer
const customerRevenueMap = {};
orders.forEach((order) => {
  if (order.status == "confirmed" && order.paymentStatus == "success" && order.userId) {
    const key = order.userId.toString();
    customerRevenueMap[key] = (customerRevenueMap[key] || 0) + order.totalAmount;
  }
});
const averageRevenuePerCustomer = Object.keys(customerRevenueMap).length
  ? Object.values(customerRevenueMap).reduce((a, b) => a + b, 0) / Object.keys(customerRevenueMap).length
  : 0;

    // ✅ Top Selling Products
    const productSalesMap = {};

    for (const order of orders) {
      if (order.status == "confirmed" && order.paymentStatus == "success") {
        for (const item of order.items) {
          // Fetch actual product
          const product =
            (await Product.findById(item.productId)) ||
            (await Product.findOne({ productId: item.productId.toString() }));

          if (!product) continue; // skip missing products

          const key = product._id.toString();
          if (!productSalesMap[key]) productSalesMap[key] = { soldQty: 0, revenue: 0 };

          productSalesMap[key].soldQty += item.quantity;
          productSalesMap[key].revenue += item.quantity * item.price;
        }
      }
    }

    // Sort products by sold quantity
    const sortedProductIds = Object.entries(productSalesMap).sort(
      (a, b) => b[1].soldQty - a[1].soldQty
    );

    const topSellingProducts = [];
    for (const [productId, stats] of sortedProductIds.slice(0, 3)) {
      const product = await Product.findById(productId);
      if (product) {
        const price =
          product.variant?.[0]?.sizes?.[0]?.sellingPrice || product.price || 0;
        topSellingProducts.push({
          productId: product._id,
          name: product.name,
          image: product.images?.[0] || null,
          price,
          soldQty: stats.soldQty,
          revenue: stats.revenue,
          changeRate: Math.floor(Math.random() * 30),
        });
      }
    }

    const result = {
      totalSales,
      totalOrders: orders.length,
      totalCustomers: [...new Set(orders.map((o) => o.userId?.toString()))].filter(Boolean).length,
      totalUsers: await FrontUser.countDocuments(),
      newCustomers: users.length,
      orderStatusSummary: {
        success: orders.filter((o) => o.status === "delivered").length,
        pending: orders.filter((o) => o.status === "pending").length,
        confirmed: orders.filter((o) => o.status === "confirmed").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
      },
      topSellingProducts, // ✅ now included
      totalProductsSold,   // new
      averageOrderValue,   // new
      averageRevenuePerCustomer, // new
    };

    res.json(result);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};


exports.getChartData = async (req, res) => {
  try {
    const { filter = "1Y" } = req.query;
    const now = new Date();
    let startDate = new Date();

    switch (filter) {
      case "1D":
        startDate.setDate(now.getDate() - 1);
        break;
      case "1W":
        startDate.setDate(now.getDate() - 7);
        break;
      case "1M":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "1Y":
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const orders = await Order.find({ createdAt: { $gte: startDate } });

    const grouping = {};

    orders.forEach((o) => {
      if (o.status === "cancelled" || o.status == "pending" || o.paymentStatus !== "success") return; // skip cancelled

      const d = new Date(o.createdAt);
      let label;

      if (filter === "1D") {
        label = d.getHours().toString().padStart(2, "0") + ":00"; // hourly
      } else if (filter === "1W") {
        label = d.toLocaleString("default", { weekday: "short" }); // day of week
      } else if (filter === "1M") {
        label = d.getDate().toString(); // day of month
      } else {
        label = getMonthName(d.getMonth()); // month name
      }

      if (!grouping[label]) {
        grouping[label] = { totalSales: 0, totalProductsSold: 0, ordersCount: 0 };
      }

      grouping[label].totalSales += o.totalAmount || 0;
      grouping[label].totalProductsSold += o.items.reduce((sum, i) => sum + i.quantity, 0);
      grouping[label].ordersCount += 1;
    });

    const data = Object.entries(grouping).map(([label, stats]) => ({
      label,
      totalSales: stats.totalSales,
      totalProductsSold: stats.totalProductsSold,
      averageOrderValue: stats.ordersCount ? stats.totalSales / stats.ordersCount : 0,
    }));

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chart data" });
  }
};

