const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },

  // Core Metrics
  totalSales: { type: Number, default: 0 },  // dynamic from delivered orders
  salesReturn: { type: Number, default: 0 }, // cancelled/refunded orders

  // New field instead of purchaseReturn
  averageOrderValue: { type: Number, default: 0 }, // totalSales / totalOrders

  // Trend data
  monthlySales: [{
    month: { type: String },
    totalSales: { type: Number, default: 0 },
  }],
  weeklySales: [{
    week: { type: String },
    totalSales: { type: Number, default: 0 },
  }],
  yearlySales: [{
    year: { type: String },
    totalSales: { type: Number, default: 0 },
  }],

  // Customer / Order Stats
  totalCustomers: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  newCustomers: { type: Number, default: 0 },
  returningCustomers: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },

  orderStatusSummary: {
    success: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },

  // Product Insights
  topSellingProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    price: { type: Number },
    soldQty: { type: Number },
    revenue: { type: Number },
    changeRate: { type: Number }
  }],

  // Feedback
  customerSatisfaction: {
    averageRating: { type: Number, default: 0 },
    positiveFeedbacks: { type: Number, default: 0 },
    negativeFeedbacks: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSchema);
