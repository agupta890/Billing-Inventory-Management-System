const express = require('express')

const router = express.Router()

// import controllers
const {Login, Register} = require('../controllers/auth-controller')

// routes
router.route('/register').post(Register)
router.route('/login').get(Login)

module.exports = router