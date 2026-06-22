const express = require('express')

const app = express()

// import routes
const authRoutes = require('./routes/auth-routes')

// middleware use
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})