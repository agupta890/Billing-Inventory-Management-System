# 📚 Bookstore Billing & Inventory Management System - MERN Stack

## Project Overview
A complete MERN stack web application for managing bookstore inventory, generating bills with GST, handling discounts, and sharing bills via WhatsApp. The system supports dual roles (Owner and Employee) with role-based access control.

---

## 🎯 Project Architecture

### Tech Stack
- **Frontend:** React.js, Redux/Context API, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Storage:** Cloudinary (for images)
- **PDF Generation:** jsPDF, html2pdf
- **WhatsApp Integration:** WhatsApp Business API / Twilio
- **Authentication:** JWT

---

## 📁 Project Structure

```
bookstore-management/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── OwnerDashboard.jsx
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   └── DashboardStats.jsx
│   │   │   ├── Products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── AddProduct.jsx
│   │   │   │   ├── EditProduct.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   └── DeleteProduct.jsx
│   │   │   ├── Billing/
│   │   │   │   ├── BillingForm.jsx
│   │   │   │   ├── BillPreview.jsx
│   │   │   │   ├── BillTemplate.jsx
│   │   │   │   ├── BillPDF.jsx
│   │   │   │   └── ShareBillWhatsApp.jsx
│   │   │   ├── Inventory/
│   │   │   │   ├── InventoryDashboard.jsx
│   │   │   │   ├── StockUpdate.jsx
│   │   │   │   └── LowStockAlert.jsx
│   │   │   ├── Settings/
│   │   │   │   ├── CompanySettings.jsx
│   │   │   │   ├── DiscountSettings.jsx
│   │   │   │   ├── LogoUpload.jsx
│   │   │   │   └── GSTSettings.jsx
│   │   │   ├── Reports/
│   │   │   │   ├── SalesReport.jsx
│   │   │   │   ├── InventoryReport.jsx
│   │   │   │   └── BillingHistory.jsx
│   │   │   └── Common/
│   │   │       ├── Header.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── Loading.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── Unauthorized.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ProductContext.jsx
│   │   │   ├── BillingContext.jsx
│   │   │   └── SettingsContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── billingService.js
│   │   │   ├── inventoryService.js
│   │   │   └── reportService.js
│   │   ├── utils/
│   │   │   ├── pdfGenerator.js
│   │   │   ├── billCalculator.js
│   │   │   ├── whatsappService.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Bill.js
│   │   ├── Inventory.js
│   │   ├── Discount.js
│   │   └── CompanySettings.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── bills.js
│   │   ├── inventory.js
│   │   ├── discounts.js
│   │   ├── reports.js
│   │   └── settings.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── billController.js
│   │   ├── inventoryController.js
│   │   ├── discountController.js
│   │   ├── reportController.js
│   │   └── settingsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── billCalculator.js
│   │   ├── pdfGenerator.js
│   │   ├── whatsappService.js
│   │   ├── cloudinaryConfig.js
│   │   └── validators.js
│   ├── config/
│   │   ├── database.js
│   │   └── constants.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🗄️ Database Schemas

### 1. User Schema
```javascript
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['owner', 'employee'], 
    required: true 
  },
  phone: { type: String },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2. Product Schema
```javascript
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
    public_id: String, 
    url: String 
  },
  supplier: String,
  reorderLevel: { type: Number, default: 10 },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 3. Bill Schema
```javascript
const billSchema = new Schema({
  billNumber: { type: String, unique: true, required: true },
  billDate: { type: Date, default: Date.now },
  customerName: { type: String, required: true },
  customerPhone: String,
  customerEmail: String,
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
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
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  status: { 
    type: String, 
    enum: ['draft', 'completed', 'cancelled'], 
    default: 'draft' 
  },
  createdAt: { type: Date, default: Date.now }
});
```

### 4. Inventory Schema
```javascript
const inventorySchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['add', 'remove', 'sale'] },
  reason: String,
  reference: String,
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
```

### 5. Discount Schema
```javascript
const discountSchema = new Schema({
  discountName: { type: String, required: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  description: String,
  isActive: { type: Boolean, default: true },
  applicableBooks: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  startDate: Date,
  endDate: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
```

### 6. Company Settings Schema
```javascript
const settingsSchema = new Schema({
  companyName: { type: String, required: true },
  companyAddress: String,
  companyPhone: String,
  companyEmail: String,
  gstNumber: String,
  panNumber: String,
  logo: { public_id: String, url: String },
  defaultGST: { type: Number, default: 18 },
  defaultDiscount: { type: Number, default: 0 },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  whatsappNumber: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
GET    /api/auth/profile        - Get user profile
PUT    /api/auth/profile        - Update user profile
```

### Products (Owner Only - Add/Delete, Employee - View)
```
GET    /api/products            - Get all products
POST   /api/products            - Add new product (Owner)
GET    /api/products/:id        - Get product details
PUT    /api/products/:id        - Update product (Owner)
DELETE /api/products/:id        - Delete product (Owner)
GET    /api/products/search     - Search products
```

### Bills (Both can generate, but data differs)
```
GET    /api/bills               - Get billing history
POST   /api/bills               - Create new bill
GET    /api/bills/:id           - Get bill details
PUT    /api/bills/:id           - Update bill (draft only)
DELETE /api/bills/:id           - Delete bill (draft only)
POST   /api/bills/:id/pdf       - Generate PDF
POST   /api/bills/:id/whatsapp  - Send via WhatsApp
```

### Inventory
```
GET    /api/inventory           - Get inventory
POST   /api/inventory/add       - Add stock (Owner)
POST   /api/inventory/remove    - Remove stock (Owner)
GET    /api/inventory/low-stock - Low stock alerts
POST   /api/inventory/update    - Bulk update (Owner)
```

### Discounts (Owner Only)
```
GET    /api/discounts           - Get all discounts
POST   /api/discounts           - Create discount
PUT    /api/discounts/:id       - Update discount
DELETE /api/discounts/:id       - Delete discount
```

### Reports (Both can view)
```
GET    /api/reports/sales       - Sales report
GET    /api/reports/inventory   - Inventory report
GET    /api/reports/daily       - Daily report
GET    /api/reports/monthly     - Monthly report
```

### Settings (Owner Only)
```
GET    /api/settings            - Get company settings
PUT    /api/settings            - Update settings
POST   /api/settings/logo       - Upload logo
```

---

## 🎨 Frontend Components - Detailed

### 1. Authentication Flow
**Components:**
- Login.jsx - Email/Password login form
- Register.jsx - New user registration
- ProtectedRoute.jsx - Route guard for role-based access

**Features:**
- JWT token storage in localStorage
- Auto-redirect to dashboard on login
- Role-based route protection

### 2. Dashboard
**Owner Dashboard:**
- Total Sales, Total Revenue, Low Stock Products
- Recent Transactions
- Quick Actions: Add Product, Generate Bill
- Analytics Charts

**Employee Dashboard:**
- Quick Bill Generation
- Sales Today
- Recent Bills Generated

### 3. Product Management
**Components:**
- ProductList.jsx - Display all products with filters
- AddProduct.jsx - Form to add new book with image upload
- EditProduct.jsx - Update product details
- DeleteProduct.jsx - Confirmation modal (Owner only)
- ProductCard.jsx - Individual product display

**Features:**
- Search, sort, and filter functionality
- Image upload to Cloudinary
- Stock level indicator
- Reorder level alert

### 4. Billing System
**Components:**
- BillingForm.jsx - Add items to cart
  - Product search/selection
  - Quantity input
  - Real-time price calculation
  
- BillPreview.jsx - Display bill before saving
  - Item breakdown
  - Subtotal, Discount, GST calculation
  - Customer details form

- BillTemplate.jsx - Formatted bill display
  - Company logo at top
  - Professional layout
  - All required details

- BillPDF.jsx - PDF generation and download
  - Uses jsPDF
  - Print-ready format
  - Logo integration

- ShareBillWhatsApp.jsx - WhatsApp share button
  - Pre-formatted message
  - PDF attachment option

**Calculation Logic:**
```
Subtotal = Sum of (quantity × price)
After Discount = Subtotal - (Subtotal × discountPercent/100)
GST Amount = After Discount × (18/100)
Total = After Discount + GST Amount
```

### 5. Inventory Management
**Components:**
- InventoryDashboard.jsx - Stock overview
- StockUpdate.jsx - Add/remove stock
- LowStockAlert.jsx - Alert for products below reorder level

**Features:**
- Real-time stock tracking
- Stock history log
- Reorder recommendations

### 6. Settings
**Components:**
- CompanySettings.jsx - Business info
- LogoUpload.jsx - Logo management
- DiscountSettings.jsx - Manage global discounts
- GSTSettings.jsx - GST configuration

---

## 🔐 Authentication & Authorization

### Middleware Structure
```javascript
// auth.js - Verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// roleCheck.js - Verify user role
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  };
};
```

### Route Protection Examples
```javascript
// Owner only routes
router.post('/products', authMiddleware, checkRole(['owner']), addProduct);
router.delete('/products/:id', authMiddleware, checkRole(['owner']), deleteProduct);

// Both can access
router.get('/bills', authMiddleware, getBills);

// But employee cannot update certain fields
router.post('/bills', authMiddleware, createBill);
```

---

## 📄 PDF Generation & Sharing

### PDF Structure
```javascript
// Using jsPDF and html2pdf
const generateBillPDF = (billData, logoUrl) => {
  const doc = new jsPDF();
  
  // Add logo
  doc.addImage(logoUrl, 'PNG', 10, 10, 30, 30);
  
  // Add company header
  doc.setFontSize(16);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  // Add bill details
  doc.setFontSize(10);
  doc.text(`Bill No: ${billData.billNumber}`, 10, 50);
  doc.text(`Date: ${billData.billDate}`, 10, 60);
  
  // Add items table
  let y = 80;
  billData.items.forEach(item => {
    doc.text(item.productName, 10, y);
    doc.text(item.quantity.toString(), 100, y);
    doc.text(item.unitPrice.toString(), 130, y);
    doc.text(item.total.toString(), 160, y);
    y += 10;
  });
  
  // Add totals
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ₹${billData.totalAmount}`, 130, y + 20);
  
  return doc;
};
```

### WhatsApp Integration
```javascript
// Using Twilio WhatsApp API
const sendBillViaWhatsApp = async (phoneNumber, billPDF, billNumber) => {
  const client = twilio(accountSid, authToken);
  
  await client.messages.create({
    from: 'whatsapp:+1234567890',
    to: `whatsapp:${phoneNumber}`,
    body: `Your bill #${billNumber} is ready. Please find attached.`,
    mediaUrl: [billPDF] // PDF URL
  });
};
```

---

## 🛠️ Backend Setup Guide

### 1. Install Dependencies
```bash
cd backend
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install cloudinary multer
npm install jspdf html2pdf.js twilio
npm install --save-dev nodemon
```

### 2. Environment Variables (.env)
```
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_jwt_secret_key_here
PORT=5000

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=whatsapp:+1234567890

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

NODE_ENV=development
```

### 3. Server Setup
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/discounts', require('./routes/discounts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## ⚛️ Frontend Setup Guide

### 1. Install Dependencies
```bash
npx create-react-app bookstore-frontend
cd bookstore-frontend
npm install axios react-router-dom
npm install zustand react-context-api
npm install tailwindcss postcss autoprefixer
npm install jspdf html2pdf.js
npm install react-icons
npm install date-fns
npm install react-hot-toast
```

### 2. Environment Variables (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD=your_cloudinary_cloud_name
VITE_WHATSAPP_NUMBER=your_whatsapp_number
```

### 3. Context Setup
```javascript
// AuthContext.jsx
import React, { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 📊 Key Features Implementation

### 1. Bill Calculation Engine
```javascript
// billCalculator.js
const calculateBill = (items, discountPercent = 0, gstPercent = 18) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );

  // Apply discount
  const discountAmount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discountAmount;

  // Calculate GST
  const gstAmount = (afterDiscount * gstPercent) / 100;

  // Final total
  const totalAmount = afterDiscount + gstAmount;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    gstPercent,
    gstAmount,
    totalAmount
  };
};

module.exports = calculateBill;
```

### 2. Stock Management
```javascript
// When bill is created, update stock
const createBill = async (billData) => {
  // Create bill
  const bill = await Bill.create(billData);

  // Update stock for each item
  for (let item of billData.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: -item.quantity } }
    );

    // Log inventory transaction
    await Inventory.create({
      productId: item.productId,
      quantity: -item.quantity,
      type: 'sale',
      reference: bill._id,
      recordedBy: req.user.id
    });
  }

  return bill;
};
```

### 3. Bill Number Generation
```javascript
// Generate unique bill number
const generateBillNumber = async () => {
  const lastBill = await Bill.findOne()
    .sort({ createdAt: -1 })
    .limit(1);

  const billNumber = lastBill 
    ? parseInt(lastBill.billNumber) + 1 
    : 1001;

  return `INV-${new Date().getFullYear()}-${String(billNumber).padStart(5, '0')}`;
};
```

---

## 🎯 Implementation Steps

### Phase 1: Setup & Database
1. Initialize Node.js/Express backend
2. Setup MongoDB connection
3. Create all Mongoose schemas
4. Setup authentication system (JWT)

### Phase 2: Backend API
1. Create authentication controllers
2. Product CRUD operations
3. Bill generation and management
4. Inventory tracking
5. Report generation

### Phase 3: Frontend Setup
1. Create React app structure
2. Setup routing and navigation
3. Create reusable components
4. Implement authentication flow

### Phase 4: Core Features
1. Product listing and management
2. Bill generation interface
3. PDF generation and download
4. WhatsApp integration

### Phase 5: Advanced Features
1. Discount management
2. Inventory analytics
3. Sales reports
4. Settings management

### Phase 6: Testing & Deployment
1. Unit and integration testing
2. Bug fixes and optimization
3. Deployment to Heroku/Vercel
4. Database backup strategy

---

## 🔒 Security Best Practices

1. **Password Hashing:** Use bcryptjs for password encryption
2. **JWT Tokens:** Implement token refresh mechanism
3. **CORS:** Restrict API access to frontend domain
4. **Input Validation:** Validate all user inputs
5. **Rate Limiting:** Prevent brute force attacks
6. **SQL Injection Prevention:** Use parameterized queries
7. **XSS Protection:** Sanitize user inputs
8. **HTTPS:** Use SSL/TLS in production

---

## 📦 Deployment

### Backend Deployment (Heroku)
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
npm run build
vercel --prod
```

---

## 📈 Future Enhancements

1. **Barcode Scanning** - QR code for quick product lookup
2. **Analytics Dashboard** - Advanced charts and metrics
3. **Multi-location Support** - Multiple store management
4. **Supplier Management** - Purchase orders and tracking
5. **Customer Loyalty** - Rewards and points system
6. **Mobile App** - React Native version
7. **Subscription Billing** - Recurring bills
8. **Email Integration** - Automated bill emails

---

## 🚨 Common Issues & Solutions

### Issue: CORS Error
```javascript
// Add to server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: Image Upload Fails
```javascript
// Check Cloudinary credentials
// Ensure file size limits are set correctly
// Use proper FormData in frontend
```

### Issue: Bill PDF Not Generated
```javascript
// Install: npm install jspdf html2canvas
// Check image URLs are accessible
// Verify font files are available
```

---

## 📚 References & Resources

- **Express.js:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **React.js:** https://react.dev/
- **Cloudinary:** https://cloudinary.com/documentation
- **jsPDF:** https://github.com/parallax/jsPDF
- **Twilio:** https://www.twilio.com/docs

---

## ✅ Checklist for Development

- [ ] Backend setup and database connection
- [ ] Authentication system (login/register)
- [ ] Role-based access control
- [ ] Product management (CRUD)
- [ ] Bill generation logic
- [ ] PDF generation
- [ ] WhatsApp integration
- [ ] Inventory management
- [ ] Reports and analytics
- [ ] Settings management
- [ ] Frontend UI implementation
- [ ] Testing and debugging
- [ ] Deployment

---

## 📞 Support & Contact

For issues or questions:
1. Check MongoDB logs: `mongod --logpath ~/mongodb.log`
2. Review API responses in browser DevTools
3. Check environment variables are loaded
4. Verify JWT token in localStorage
5. Check Cloudinary dashboard for upload status

---

**Project Version:** 1.0.0  
**Last Updated:** 2026  
**Author:** Your Name  
**License:** MIT

---

## 🎓 Learning Resources

- MERN Stack Complete Course
- MongoDB Advanced Queries
- JWT Authentication Best Practices
- React Context API vs Redux
- PDF Generation in JavaScript
- WhatsApp Business API Integration
- Cloudinary Image Optimization

This comprehensive guide covers all aspects of your bookstore billing and inventory management system. Follow the implementation steps sequentially for the best results!