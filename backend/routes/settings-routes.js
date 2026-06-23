const express = require('express');
const router = express.Router();

const {
  getSettings,
  updateSettings,
  uploadLogo
} = require('../controllers/settings-controller');

const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.route('/')
  .get(authMiddleware, getSettings)
  .put(authMiddleware, checkRole(['owner']), updateSettings);

router.route('/logo')
  .post(authMiddleware, checkRole(['owner']), uploadLogo);

module.exports = router;
