const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

router.post('/', protect, adminOnly, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);
router.get('/category/:categoryId', productController.getProductsByCategory);

module.exports = router;
