const express = require('express');
const router = express.Router();

const {
  getInventory,
  addStock,
  removeStock,
  getLowStockAlerts,
  bulkUpdate
} = require('../controllers/inventory-controller');

const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.route('/')
  .get(authMiddleware, getInventory);

router.route('/add')
  .post(authMiddleware, checkRole(['owner']), addStock);

router.route('/remove')
  .post(authMiddleware, checkRole(['owner']), removeStock);

router.route('/low-stock')
  .get(authMiddleware, getLowStockAlerts);

router.route('/update')
  .post(authMiddleware, checkRole(['owner']), bulkUpdate);

module.exports = router;
