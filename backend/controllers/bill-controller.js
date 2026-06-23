const Bill = require("../models/bill-model");
const Product = require("../models/product-model");
const Inventory = require("../models/inventory-model");
const CompanySettings = require("../models/settings-model");
const status_code = require("../utils/status-code");

// Helper to generate bill number
const generateBillNumber = async () => {
  const lastBill = await Bill.findOne().sort({ createdAt: -1 });
  let nextNumber = 1001;
  if (lastBill && lastBill.billNumber) {
    const parts = lastBill.billNumber.split("-");
    const lastNum = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }
  return `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(5, "0")}`;
};

// Create new bill
const createBill = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items, // array of { productId, quantity }
      discountPercent,
      gstPercent,
      paymentMethod,
      paymentStatus,
      notes,
      status
    } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Customer name, payment method, and items are required" });
    }

    // Resolve details for each item and check stock
    const resolvedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(status_code.NOT_FOUND).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (status !== "draft" && product.stock < item.quantity) {
        return res.status(status_code.BAD_REQUEST).json({ message: `Insufficient stock for book: ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}` });
      }

      const itemTotal = item.quantity * product.price;
      calculatedSubtotal += itemTotal;

      resolvedItems.push({
        productId: product._id,
        productName: product.title,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal
      });
    }

    // Calculate totals
    const dPercent = discountPercent !== undefined ? Number(discountPercent) : 0;
    const gPercent = gstPercent !== undefined ? Number(gstPercent) : 18;

    const discountAmount = (calculatedSubtotal * dPercent) / 100;
    const afterDiscount = calculatedSubtotal - discountAmount;
    const gstAmount = (afterDiscount * gPercent) / 100;
    const totalAmount = afterDiscount + gstAmount;

    const billNumber = await generateBillNumber();

    const newBill = await Bill.create({
      billNumber,
      customerName,
      customerPhone,
      customerEmail,
      items: resolvedItems,
      subtotal: calculatedSubtotal,
      discountPercent: dPercent,
      discountAmount,
      gstPercent: gPercent,
      gstAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentStatus || "paid",
      notes,
      status: status || "completed",
      createdBy: req.user._id
    });

    // If status is completed, decrement stock and log inventory
    if (newBill.status === "completed") {
      for (const item of resolvedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });

        await Inventory.create({
          productId: item.productId,
          quantity: -item.quantity,
          type: "sale",
          reason: `Sale - Invoice #${billNumber}`,
          reference: newBill._id.toString(),
          recordedBy: req.user._id
        });
      }
    }

    res.status(status_code.CREATED).json({ message: "Bill created successfully", bill: newBill });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Get billing history
const getBills = async (req, res) => {
  try {
    const { customerPhone, startDate, endDate, status } = req.query;
    let query = {};

    if (customerPhone) {
      query.customerPhone = customerPhone;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.billDate.$lte = end;
      }
    }

    const bills = await Bill.find(query)
      .populate("createdBy", "name role")
      .sort("-createdAt");

    res.status(status_code.OK).json({ count: bills.length, bills });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Get bill details
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("createdBy", "name role")
      .populate("items.productId", "title author isbn category");

    if (!bill) {
      return res.status(status_code.NOT_FOUND).json({ message: "Bill not found" });
    }

    res.status(status_code.OK).json({ bill });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Update bill (draft only)
const updateBill = async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, items, discountPercent, gstPercent, paymentMethod, paymentStatus, notes, status } = req.body;
    const billId = req.params.id;

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(status_code.NOT_FOUND).json({ message: "Bill not found" });
    }

    if (bill.status !== "draft") {
      return res.status(status_code.BAD_REQUEST).json({ message: "Only draft bills can be updated" });
    }

    // Update details
    if (customerName) bill.customerName = customerName;
    if (customerPhone !== undefined) bill.customerPhone = customerPhone;
    if (customerEmail !== undefined) bill.customerEmail = customerEmail;
    if (paymentMethod) bill.paymentMethod = paymentMethod;
    if (paymentStatus) bill.paymentStatus = paymentStatus;
    if (notes !== undefined) bill.notes = notes;

    if (items && Array.isArray(items) && items.length > 0) {
      const resolvedItems = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(status_code.NOT_FOUND).json({ message: `Product with ID ${item.productId} not found` });
        }

        // If transitioning to completed, check stock
        if (status === "completed" && product.stock < item.quantity) {
          return res.status(status_code.BAD_REQUEST).json({ message: `Insufficient stock for book: ${product.title}` });
        }

        const itemTotal = item.quantity * product.price;
        calculatedSubtotal += itemTotal;

        resolvedItems.push({
          productId: product._id,
          productName: product.title,
          quantity: item.quantity,
          unitPrice: product.price,
          total: itemTotal
        });
      }

      bill.items = resolvedItems;
      bill.subtotal = calculatedSubtotal;
    }

    const dPercent = discountPercent !== undefined ? Number(discountPercent) : bill.discountPercent;
    const gPercent = gstPercent !== undefined ? Number(gstPercent) : bill.gstPercent;

    bill.discountPercent = dPercent;
    bill.gstPercent = gPercent;

    // Recalculate totals
    bill.discountAmount = (bill.subtotal * dPercent) / 100;
    const afterDiscount = bill.subtotal - bill.discountAmount;
    bill.gstAmount = (afterDiscount * gPercent) / 100;
    bill.totalAmount = afterDiscount + bill.gstAmount;

    // Transitioning from draft to completed
    if (status === "completed") {
      bill.status = "completed";
      
      // Decrement stock and log inventory
      for (const item of bill.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });

        await Inventory.create({
          productId: item.productId,
          quantity: -item.quantity,
          type: "sale",
          reason: `Sale - Invoice #${bill.billNumber}`,
          reference: bill._id.toString(),
          recordedBy: req.user._id
        });
      }
    } else if (status === "cancelled") {
      bill.status = "cancelled";
    }

    await bill.save();
    res.status(status_code.OK).json({ message: "Bill updated successfully", bill });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Delete bill (draft only)
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(status_code.NOT_FOUND).json({ message: "Bill not found" });
    }

    if (bill.status !== "draft") {
      return res.status(status_code.BAD_REQUEST).json({ message: "Only draft bills can be deleted" });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.status(status_code.OK).json({ message: "Draft bill deleted successfully" });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Send via WhatsApp
const sendBillWhatsApp = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(status_code.NOT_FOUND).json({ message: "Bill not found" });
    }

    const settings = await CompanySettings.findOne() || { companyName: "Bookstore" };
    const customerPhone = bill.customerPhone;
    
    if (!customerPhone) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Customer phone number is missing from this bill" });
    }

    // Format a nice whatsapp message
    const message = `Hello ${bill.customerName},\n\nThank you for shopping at *${settings.companyName}*!\nYour invoice *${bill.billNumber}* dated *${new Date(bill.billDate).toLocaleDateString()}* is ready.\n\n*Summary:*\nTotal Amount: ₹${bill.totalAmount.toFixed(2)}\nPayment Status: ${bill.paymentStatus.toUpperCase()}\nPayment Method: ${bill.paymentMethod.toUpperCase()}\n\nWe look forward to serving you again!`;
    const encodedMessage = encodeURIComponent(message);
    
    let formattedPhone = customerPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    let twilioSent = false;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
      try {
        const twilio = require("twilio");
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          from: process.env.TWILIO_PHONE,
          to: `whatsapp:+${formattedPhone}`,
          body: message
        });
        twilioSent = true;
      } catch (err) {
        console.error("Twilio send failed, falling back to wa.me link:", err.message);
      }
    }

    res.status(status_code.OK).json({
      message: twilioSent ? "WhatsApp message sent via Twilio" : "WhatsApp link generated successfully",
      twilioSent,
      whatsappLink
    });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  sendBillWhatsApp
};
