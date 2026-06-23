const Bill = require("../models/bill-model");
const Product = require("../models/product-model");
const status_code = require("../utils/status-code");

// Sales Report
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = { status: "completed" };

    if (startDate || endDate) {
      matchQuery.billDate = {};
      if (startDate) matchQuery.billDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.billDate.$lte = end;
      }
    }

    const salesStats = await Bill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalSubtotal: { $sum: "$subtotal" },
          totalDiscount: { $sum: "$discountAmount" },
          totalGST: { $sum: "$gstAmount" },
          invoiceCount: { $sum: 1 }
        }
      }
    ]);

    const paymentStats = await Bill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const stats = salesStats[0] || {
      totalRevenue: 0,
      totalSubtotal: 0,
      totalDiscount: 0,
      totalGST: 0,
      invoiceCount: 0
    };

    res.status(status_code.OK).json({ stats, paymentStats });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Inventory Report
const getInventoryReport = async (req, res) => {
  try {
    // Total stock valuation and summary
    const summary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          retailValuation: { $sum: { $multiply: ["$stock", "$price"] } },
          costValuation: { $sum: { $multiply: ["$stock", { $ifNull: ["$costPrice", "$price"] }] } }
        }
      }
    ]);

    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" }
        }
      }
    ]);

    // Low stock count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$reorderLevel"] },
      status: "active"
    });

    const report = summary[0] || {
      totalItems: 0,
      totalStock: 0,
      retailValuation: 0,
      costValuation: 0
    };

    res.status(status_code.OK).json({
      summary: { ...report, lowStockCount },
      categories
    });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Daily Report (grouped by date or hourly for today)
const getDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Bill.aggregate([
      {
        $match: {
          status: "completed",
          billDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          salesAmount: { $sum: "$totalAmount" },
          discountAmount: { $sum: "$discountAmount" },
          gstAmount: { $sum: "$gstAmount" },
          ordersCount: { $sum: 1 }
        }
      }
    ]);

    // Group sales hourly
    const hourlySales = await Bill.aggregate([
      {
        $match: {
          status: "completed",
          billDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $project: {
          hour: { $hour: "$billDate" },
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: "$hour",
          sales: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(status_code.OK).json({
      summary: stats[0] || { salesAmount: 0, discountAmount: 0, gstAmount: 0, ordersCount: 0 },
      hourlySales
    });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Monthly Report (Grouped by day of the month)
const getMonthlyReport = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stats = await Bill.aggregate([
      {
        $match: {
          status: "completed",
          billDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          salesAmount: { $sum: "$totalAmount" },
          discountAmount: { $sum: "$discountAmount" },
          gstAmount: { $sum: "$gstAmount" },
          ordersCount: { $sum: 1 }
        }
      }
    ]);

    // Group sales by day
    const dailySales = await Bill.aggregate([
      {
        $match: {
          status: "completed",
          billDate: { $gte: startOfMonth }
        }
      },
      {
        $project: {
          day: { $dayOfMonth: "$billDate" },
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: "$day",
          sales: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(status_code.OK).json({
      summary: stats[0] || { salesAmount: 0, discountAmount: 0, gstAmount: 0, ordersCount: 0 },
      dailySales
    });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getDailyReport,
  getMonthlyReport
};
