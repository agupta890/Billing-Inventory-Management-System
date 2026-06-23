const CompanySettings = require("../models/settings-model");
const status_code = require("../utils/status-code");
const { uploadBuffer, deleteImage } = require("../utils/cloudinaryConfig");


// Get settings (will create default if doesn't exist)
const getSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: "My Bookstore",
        companyAddress: "123 Main Street, City",
        companyPhone: "9876543210",
        companyEmail: "info@mybookstore.com",
        gstNumber: "22AAAAA0000A1Z5",
        panNumber: "ABCDE1234F",
        logo: { public_id: "", url: "" },
        defaultGST: 18,
        defaultDiscount: 0,
        bankDetails: {
          accountNumber: "123456789012",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India"
        },
        whatsappNumber: "919876543210"
      });
    }
    res.status(status_code.OK).json({ settings });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Update settings (Owner Only)
const updateSettings = async (req, res) => {
  try {
    const {
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      gstNumber,
      panNumber,
      logo,
      defaultGST,
      defaultDiscount,
      bankDetails,
      whatsappNumber
    } = req.body;

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = new CompanySettings();
    }

    if (companyName) settings.companyName = companyName;
    if (companyAddress !== undefined) settings.companyAddress = companyAddress;
    if (companyPhone !== undefined) settings.companyPhone = companyPhone;
    if (companyEmail !== undefined) settings.companyEmail = companyEmail;
    if (gstNumber !== undefined) settings.gstNumber = gstNumber;
    if (panNumber !== undefined) settings.panNumber = panNumber;
    if (logo) settings.logo = logo;
    if (defaultGST !== undefined) settings.defaultGST = defaultGST;
    if (defaultDiscount !== undefined) settings.defaultDiscount = defaultDiscount;
    
    if (bankDetails) {
      settings.bankDetails = {
        accountNumber: bankDetails.accountNumber !== undefined ? bankDetails.accountNumber : (settings.bankDetails?.accountNumber || ""),
        ifscCode: bankDetails.ifscCode !== undefined ? bankDetails.ifscCode : (settings.bankDetails?.ifscCode || ""),
        bankName: bankDetails.bankName !== undefined ? bankDetails.bankName : (settings.bankDetails?.bankName || "")
      };
    }
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;

    await settings.save();
    res.status(status_code.OK).json({ message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Upload logo (Owner Only)
const uploadLogo = async (req, res) => {
  try {
    let logoObj = null;

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = new CompanySettings({
        companyName: "My Bookstore"
      });
    }

    if (req.file) {
      try {
        // If there's an existing logo in settings, delete it from Cloudinary
        if (settings.logo && settings.logo.public_id) {
          await deleteImage(settings.logo.public_id);
        }
        // Upload new logo buffer
        const uploadResult = await uploadBuffer(req.file.buffer, "settings");
        logoObj = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        return res.status(status_code.BAD_REQUEST).json({
          message: "Failed to upload logo to Cloudinary. Please verify your CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the backend .env file.",
          error: uploadError.message
        });
      }
    } else {
      // Fallback to body properties
      const { url, public_id, logo } = req.body;
      let incomingLogo = logo;
      if (!incomingLogo && url) {
        incomingLogo = { url, public_id: public_id || "" };
      }
      
      if (!incomingLogo) {
        return res.status(status_code.BAD_REQUEST).json({ message: "Logo file or logo details are required" });
      }

      logoObj = typeof incomingLogo === "string" ? JSON.parse(incomingLogo) : incomingLogo;

      // If URL/public_id changes, delete old image from Cloudinary
      if (settings.logo && settings.logo.public_id && settings.logo.public_id !== logoObj.public_id) {
        await deleteImage(settings.logo.public_id);
      }
    }

    settings.logo = logoObj;
    await settings.save();

    res.status(status_code.OK).json({ message: "Logo uploaded successfully", logo: settings.logo });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = {
  getSettings,
  updateSettings,
  uploadLogo
};
