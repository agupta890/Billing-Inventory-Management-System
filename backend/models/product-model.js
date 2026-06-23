const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  costPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  image: { 
    public_id: { type: String }, 
    url: { type: String } 
  },
  supplier: { type: String },
  reorderLevel: { type: Number, default: 10 },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
