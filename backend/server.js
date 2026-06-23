const express = require('express')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()

// require database connection
const connectDB = require("./config/db")

// import routes
const authRoutes = require('./routes/auth-routes')
const productRoutes = require('./routes/product-routes')
const billRoutes = require('./routes/bill-routes')
const inventoryRoutes = require('./routes/inventory-routes')
const discountRoutes = require('./routes/discount-routes')
const reportRoutes = require('./routes/report-routes')
const settingsRoutes = require('./routes/settings-routes')

// middleware use
app.use(cors({
    origin: ["https://billing-inventory-management-system-n79h.onrender.com","http://localhost:5173/"], // dynamically allow any requesting origin in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/bills', billRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/discounts', discountRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/settings', settingsRoutes)

// health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 3000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}).catch(err => {
    console.error('Failed to connect to database', err)
})
