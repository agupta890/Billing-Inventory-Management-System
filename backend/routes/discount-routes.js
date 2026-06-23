const express = require('express');
const router = express.Router();

const {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount
} = require('../controllers/discount-controller');

const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.route('/')
  .get(authMiddleware, getDiscounts)
  .post(authMiddleware, checkRole(['owner']), createDiscount);

router.route('/:id')
  .put(authMiddleware, checkRole(['owner']), updateDiscount)
  .delete(authMiddleware, checkRole(['owner']), deleteDiscount);

module.exports = router;
