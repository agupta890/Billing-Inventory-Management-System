const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingsSchema = new Schema({
  companyName: { type: String, required: true },
  companyAddress: { type: String },
  companyPhone: { type: String },
  companyEmail: { type: String },
  gstNumber: { type: String },
  panNumber: { type: String },
  logo: { 
    public_id: { type: String }, 
    url: { type: String } 
  },
  defaultGST: { type: Number, default: 18 },
  defaultDiscount: { type: Number, default: 0 },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  whatsappNumber: { type: String }
}, { timestamps: true });

const CompanySettings = mongoose.model("CompanySettings", settingsSchema);
module.exports = CompanySettings;
