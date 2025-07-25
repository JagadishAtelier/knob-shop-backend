const AnalyticsSnapshot = require('../models/AnalyticsModel');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const getMonthName = (i) => new Date(0, i).toLocaleString('default', { month: 'short' });

exports.generateAnalyticsSnapshot = async (req, res) => {
  try {
    const orders = await Order.find({});
    const users = await User.find({});
    const products = await Product.find({});

    const totalSales = orders.reduce((acc, order) => 
      acc + (order.status === 'delivered' ? order.totalAmount : 0), 0);
    const salesReturn = orders.reduce((acc, order) => 
      acc + (order.status === 'cancelled' ? order.totalAmount : 0), 0);

    const totalPurchases = 16000;
    const purchaseReturn = 17000;

    const monthlySales = Array(12).fill(0).map((_, i) => ({
      month: getMonthName(i),
      totalSales: 0,
      totalPurchases: 0
    }));

    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      if (order.status === 'delivered') {
        monthlySales[month].totalSales += order.totalAmount;
      }
    });

    const orderStatusSummary = {
      success: orders.filter(o => o.status === 'delivered').length,
      pending: orders.filter(o => o.status === 'pending').length,
      received: orders.filter(o => o.status === 'confirmed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    const productSalesMap = {};

    orders.forEach(order => {
      order.items.forEach(item => { 
        const key = item.productId.toString();
        if (!productSalesMap[key]) {
          productSalesMap[key] = { soldQty: 0, revenue: 0 };
        }
        productSalesMap[key].soldQty += item.quantity;
        productSalesMap[key].revenue += item.quantity * item.price;
      });
    });

    const topSellingProducts = await Promise.all(
      Object.entries(productSalesMap)
        .sort((a, b) => b[1].soldQty - a[1].soldQty)
        .slice(0, 3)
        .map(async ([productId, stats]) => {
          const product = await Product.findById(productId);
          return {
            productId,
            name: product?.name || 'Unknown',
            price: product?.price || 0,
            soldQty: stats.soldQty,
            revenue: stats.revenue,
            changeRate: Math.floor(Math.random() * 30)
          };
        })
    );

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const newCustomers = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const returningCustomers = users.length - newCustomers;

    const analytics = new AnalyticsSnapshot({
      totalSales,
      salesReturn,
      totalPurchases,
      purchaseReturn,
      monthlySales,
      totalOrders: orders.length,
      totalCustomers: users.length,
      newCustomers,
      returningCustomers,
      totalSuppliers: 10090,
      orderStatusSummary,
      topSellingProducts,
      customerSatisfaction: {
        averageRating: 4.6,
        positiveFeedbacks: 340,
        negativeFeedbacks: 22
      }
    });

    await analytics.save();
    res.status(201).json({ message: 'Analytics snapshot created', analytics });

  } catch (err) {
    console.error('Analytics generation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLatestAnalyticsSnapshot = async (req, res) => {
  try {
    const { range = "Weekly" } = req.query;

    // Calculate date range based on 'range'
    const now = new Date();
    let startDate = new Date();

    if (range === "Daily") {
      startDate.setDate(now.getDate() - 1);
    } else if (range === "Weekly") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "Monthly") {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Fetch data within time range
    const orders = await Order.find({ createdAt: { $gte: startDate } });
    const users = await User.find({ createdAt: { $gte: startDate } });

    const totalSales = orders.reduce((acc, order) =>
      acc + (order.status === "delivered" ? order.totalAmount : 0), 0);
    const salesReturn = orders.reduce((acc, order) =>
      acc + (order.status === "cancelled" ? order.totalAmount : 0), 0);

    const totalPurchases = 16000;
    const purchaseReturn = 17000;

    const monthlySales = Array(12).fill(0).map((_, i) => ({
      month: getMonthName(i),
      totalSales: 0,
      totalPurchases: 0
    }));

    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      if (order.status === 'delivered') {
        monthlySales[month].totalSales += order.totalAmount;
      }
    });

    const orderStatusSummary = {
      success: orders.filter(o => o.status === 'delivered').length,
      pending: orders.filter(o => o.status === 'pending').length,
      received: orders.filter(o => o.status === 'confirmed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    const productSalesMap = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId.toString();
        if (!productSalesMap[key]) {
          productSalesMap[key] = { soldQty: 0, revenue: 0 };
        }
        productSalesMap[key].soldQty += item.quantity;
        productSalesMap[key].revenue += item.quantity * item.price;
      }
    }

    const topSellingProducts = await Promise.all(
      Object.entries(productSalesMap)
        .sort((a, b) => b[1].soldQty - a[1].soldQty)
        .slice(0, 3)
        .map(async ([productId, stats]) => {
          const product = await Product.findById(productId);
          return {
            productId,
            name: product?.name || "Unknown",
            price: product?.price || 0,
            image: product?.images?.[0] || "",       // ✅ get first image from array
            category: product?.category?.toString() || "", // optionally populate if needed
            brand: product?.brand || "",
            soldQty: stats.soldQty,
            revenue: stats.revenue,
            changeRate: Math.floor(Math.random() * 30)
          };
        })        
    );

    const newCustomers = users.length;
    const returningCustomers = await User.countDocuments() - newCustomers;

    const result = {
      totalSales,
      salesReturn,
      totalPurchases,
      purchaseReturn,
      monthlySales,
      totalOrders: orders.length,
      totalCustomers: await User.countDocuments(),
      newCustomers,
      returningCustomers,
      totalSuppliers: 10090,
      orderStatusSummary,
      topSellingProducts,
      customerSatisfaction: {
        averageRating: 4.6,
        positiveFeedbacks: 340,
        negativeFeedbacks: 22
      }
    };

    res.json(result);

  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const { filter = '1Y' } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (filter === '1D') {
      startDate.setDate(now.getDate() - 1);
    } else if (filter === '1W') {
      startDate.setDate(now.getDate() - 7);
    } else if (filter === '1M') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const orders = await Order.find({ createdAt: { $gte: startDate } });

    // group by date/month label depending on filter
    const grouping = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      let label;
      if (filter === '1D') label = d.getHours().toString().padStart(2, '0') + ':00';
      else if (filter === '1W') label = d.toLocaleString('default', { weekday: 'short' });
      else if (filter === '1M') label = getMonthName(d.getMonth());
      else label = getMonthName(d.getMonth());

      if (!grouping[label]) grouping[label] = { totalSales: 0, totalPurchases: 0 };
      if (o.status === 'delivered') grouping[label].totalSales += o.totalAmount;
      // if purchases logic exists, apply here similarly
    });

    const data = Object.entries(grouping).map(([label, stats]) => ({
      label,
      ...stats
    }));

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chart data' });
  }
};


