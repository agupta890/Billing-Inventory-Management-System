const mongoose = require("mongoose");
const { Schema } = mongoose;

const inventorySchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }, // positive for add, negative for remove/sale
  type: { type: String, enum: ['add', 'remove', 'sale'], required: true },
  reason: { type: String },
  reference: { type: String }, // stores bill ID or reference details
  recordedBy: { type: Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
