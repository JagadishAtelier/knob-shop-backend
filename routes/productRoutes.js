const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and browsing
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15
 *               price:
 *                 type: number
 *                 example: 999.99
 *               description:
 *                 type: string
 *                 example: Latest Apple smartphone
 *               category:
 *                 type: string
 *                 example: 64ae2d019d872a60b8996d00
 *               stock:
 *                 type: number
 *                 example: 10
 *               productImageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid input
 */
router.post('/', protect, adminOnly, productController.createProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with optional pagination, filtering, and sorting
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: The number of items per page.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: "price:asc"
 *         description: Sort products by a field in ascending or descending order (e.g., 'price:asc').
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by a specific category ID.
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: Search products by name or brand.
 *     responses:
 *       200:
 *         description: A list of products with pagination details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid input for category ID.
 *       500:
 *         description: Server error.
 */

router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               stock:
 *                 type: number
 *               productImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
router.put('/:id', protect, adminOnly, productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: Get products by category ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products for the category
 *       404:
 *         description: No products found
 *       500:
 *         description: Server error
 */
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/brand/:brandName', productController.getProductsByBrand);

router.get("/search/:query", productController.searchProductsByParam);


module.exports = router;
