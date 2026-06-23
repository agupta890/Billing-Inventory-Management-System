const express = require('express')
require('dotenv').config()
const cookieParser = require('cookie')

const app = express()


// require database connection
const connectDB= require("./config/db")

// import routes
const authRoutes = require('./routes/auth-routes')

// middleware use
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cooki)

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000
connectDB().then(()=>{
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})
})
