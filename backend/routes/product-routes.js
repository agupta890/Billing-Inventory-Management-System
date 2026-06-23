const express = require('express');
const router = express.Router();

const {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/product-controller');

const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.route('/')
  .get(authMiddleware, getProducts)
  .post(authMiddleware, checkRole(['owner']), upload.single('image'), addProduct);

router.route('/:id')
  .get(authMiddleware, getProductById)
  .put(authMiddleware, checkRole(['owner']), upload.single('image'), updateProduct)
  .delete(authMiddleware, checkRole(['owner']), deleteProduct);

module.exports = router;

