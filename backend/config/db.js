const mongoose = require('mongoose')

const connectDB = async()=>{
    try {
       await mongoose.connect(process.env.MONGODB_URI)
       console.log("Database connection successful")
    } catch (error) {
       console.log("Primary database connection failed:", error.message)
       try {
           console.log("Attempting fallback to local MongoDB instance (127.0.0.1:27017)...")
           await mongoose.connect("mongodb://127.0.0.1:27017/bookstore")
           console.log("Database connection fallback successful (local).")
       } catch (err) {
           console.log("Database connection fallback also failed. Please ensure a local MongoDB server is active or configure the .env connection parameters.")
       }
    }
}

module.exports = connectDB