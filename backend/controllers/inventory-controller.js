const Product = require("../models/product-model");
const Inventory = require("../models/inventory-model");
const status_code = require("../utils/status-code");

// Get inventory transactions history (with pagination/population)
const getInventory = async (req, res) => {
  try {
    const { productId, type } = req.query;
    let query = {};
    if (productId) query.productId = productId;
    if (type) query.type = type;

    const logs = await Inventory.find(query)
      .populate("productId", "title author isbn stock reorderLevel")
      .populate("recordedBy", "name role")
      .sort("-createdAt");

    res.status(status_code.OK).json({ count: logs.length, logs });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Add stock (Owner Only)
const addStock = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Product ID and a positive quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(status_code.NOT_FOUND).json({ message: "Product not found" });
    }

    // Update product stock
    product.stock += Number(quantity);
    await product.save();

    // Create inventory transaction
    const log = await Inventory.create({
      productId,
      quantity: Number(quantity),
      type: "add",
      reason: reason || "Manual stock addition",
      recordedBy: req.user._id
    });

    res.status(status_code.OK).json({ message: "Stock added successfully", product, log });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Remove stock (Owner Only)
const removeStock = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Product ID and a positive quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(status_code.NOT_FOUND).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Insufficient stock to remove" });
    }

    // Update product stock
    product.stock -= Number(quantity);
    await product.save();

    // Create inventory transaction
    const log = await Inventory.create({
      productId,
      quantity: -Number(quantity),
      type: "remove",
      reason: reason || "Manual stock removal",
      recordedBy: req.user._id
    });

    res.status(status_code.OK).json({ message: "Stock removed successfully", product, log });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Get low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    // Find products where stock is less than or equal to reorderLevel
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$reorderLevel"] },
      status: "active"
    });

    res.status(status_code.OK).json({ count: products.length, products });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Bulk update stock (Owner Only)
const bulkUpdate = async (req, res) => {
  try {
    const { updates } = req.body; // updates: [{ productId, quantity, type: 'add'|'remove', reason }]

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Updates array is required" });
    }

    const results = [];

    for (const update of updates) {
      const { productId, quantity, type, reason } = update;

      if (!productId || !quantity || quantity <= 0 || !["add", "remove"].includes(type)) {
        continue;
      }

      const product = await Product.findById(productId);
      if (!product) continue;

      if (type === "remove" && product.stock < quantity) {
        continue;
      }

      // Update product stock
      const stockChange = type === "add" ? Number(quantity) : -Number(quantity);
      product.stock += stockChange;
      await product.save();

      // Create transaction log
      const log = await Inventory.create({
        productId,
        quantity: stockChange,
        type,
        reason: reason || `Bulk stock ${type}`,
        recordedBy: req.user._id
      });

      results.push({ productId, newStock: product.stock, transactionId: log._id });
    }

    res.status(status_code.OK).json({ message: "Bulk update processed", results });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getInventory,
  addStock,
  removeStock,
  getLowStockAlerts,
  bulkUpdate
};
