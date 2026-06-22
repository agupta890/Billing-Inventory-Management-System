const express = require('express')

const router = express.Router()

// import controllers
const {Login} = require('../controllers/auth-controller')

// routes
router.route('/login').get(Login)

module.exports = router