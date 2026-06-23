const mongoose = require("mongoose");
const { Schema } = mongoose;

const discountSchema = new Schema({
  discountName: { type: String, required: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  applicableBooks: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  startDate: { type: Date },
  endDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;
