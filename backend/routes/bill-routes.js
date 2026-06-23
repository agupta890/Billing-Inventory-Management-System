const express = require('express');
const router = express.Router();

const {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  sendBillWhatsApp
} = require('../controllers/bill-controller');

const authMiddleware = require('../middleware/auth');

router.route('/')
  .get(authMiddleware, getBills)
  .post(authMiddleware, createBill);

router.route('/:id')
  .get(authMiddleware, getBillById)
  .put(authMiddleware, updateBill)
  .delete(authMiddleware, deleteBill);

router.route('/:id/whatsapp')
  .post(authMiddleware, sendBillWhatsApp);

module.exports = router;
