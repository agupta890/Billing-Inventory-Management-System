const Discount = require("../models/discount-model");
const status_code = require("../utils/status-code");

// Get all discounts
const getDiscounts = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let query = {};
    
    if (activeOnly === "true") {
      query.isActive = true;
      const now = new Date();
      query.$and = [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $eq: null } },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $eq: null } },
            { endDate: { $gte: now } }
          ]
        }
      ];
    }

    const discounts = await Discount.find(query)
      .populate("applicableBooks", "title author price isbn")
      .sort("-createdAt");

    res.status(status_code.OK).json({ count: discounts.length, discounts });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Create a discount (Owner Only)
const createDiscount = async (req, res) => {
  try {
    const { discountName, discountPercent, description, isActive, applicableBooks, startDate, endDate } = req.body;

    if (!discountName || discountPercent === undefined) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Discount name and percent are required" });
    }

    const newDiscount = await Discount.create({
      discountName,
      discountPercent,
      description,
      isActive: isActive !== undefined ? isActive : true,
      applicableBooks: applicableBooks || [],
      startDate,
      endDate,
      createdBy: req.user._id
    });

    res.status(status_code.CREATED).json({ message: "Discount created successfully", discount: newDiscount });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Update a discount (Owner Only)
const updateDiscount = async (req, res) => {
  try {
    const { discountName, discountPercent, description, isActive, applicableBooks, startDate, endDate } = req.body;
    const discountId = req.params.id;

    const discount = await Discount.findById(discountId);
    if (!discount) {
      return res.status(status_code.NOT_FOUND).json({ message: "Discount not found" });
    }

    if (discountName) discount.discountName = discountName;
    if (discountPercent !== undefined) discount.discountPercent = discountPercent;
    if (description !== undefined) discount.description = description;
    if (isActive !== undefined) discount.isActive = isActive;
    if (applicableBooks) discount.applicableBooks = applicableBooks;
    if (startDate !== undefined) discount.startDate = startDate;
    if (endDate !== undefined) discount.endDate = endDate;

    await discount.save();

    res.status(status_code.OK).json({ message: "Discount updated successfully", discount });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Delete a discount (Owner Only)
const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(status_code.NOT_FOUND).json({ message: "Discount not found" });
    }

    await Discount.findByIdAndDelete(req.params.id);
    res.status(status_code.OK).json({ message: "Discount deleted successfully" });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount
};
