const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  totalSales: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  salesReturn: { type: Number, default: 0 },
  purchaseReturn: { type: Number, default: 0 },
  monthlySales: [{
    month: { type: String },
    totalSales: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
  }],
  totalSuppliers: { type: Number, default: 0 },
  totalCustomers: { type: Number, default: 0 },
  newCustomers: { type: Number, default: 0 },
  returningCustomers: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  orderStatusSummary: {
    success: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },
  topSellingProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    price: { type: Number },
    soldQty: { type: Number },
    revenue: { type: Number },
    changeRate: { type: Number } 
  }],
  customerSatisfaction: {
    averageRating: { type: Number, default: 0 },
    positiveFeedbacks: { type: Number, default: 0 },
    negativeFeedbacks: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSchema);
