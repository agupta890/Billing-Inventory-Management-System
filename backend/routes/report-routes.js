const express = require('express');
const router = express.Router();

const {
  getSalesReport,
  getInventoryReport,
  getDailyReport,
  getMonthlyReport
} = require('../controllers/report-controller');

const authMiddleware = require('../middleware/auth');

router.get('/sales', authMiddleware, getSalesReport);
router.get('/inventory', authMiddleware, getInventoryReport);
router.get('/daily', authMiddleware, getDailyReport);
router.get('/monthly', authMiddleware, getMonthlyReport);

module.exports = router;
