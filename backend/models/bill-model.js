const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema({
  billNumber: { type: String, unique: true, required: true },
  billDate: { type: Date, default: Date.now },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  customerEmail: { type: String },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'upi', 'cheque'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending'], 
    default: 'paid' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['draft', 'completed', 'cancelled'], 
    default: 'draft' 
  }
}, { timestamps: true });

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;
