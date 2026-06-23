const express = require('express');
const router = express.Router();

// import controllers
const { Register, Login, Logout, GetProfile, UpdateProfile } = require('../controllers/auth-controller');
const authMiddleware = require('../middleware/auth');

// routes
router.route('/register').post(Register);
router.route('/login').post(Login);
router.route('/logout').post(Logout);
router.route('/profile')
  .get(authMiddleware, GetProfile)
  .put(authMiddleware, UpdateProfile);

module.exports = router;