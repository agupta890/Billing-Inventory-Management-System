const mongoose = require('mongoose')


const connectDB = async()=>{
    try {
       await mongoose.connect(process.env.MONGODB_URI)
       console.log("connection successful")
        
        
    } catch (error) {
        console.log("connection failed",error.message)
    }
}


module.exports = connectDB