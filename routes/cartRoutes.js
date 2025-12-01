const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartByUserId,
  deleteCartItem,
  clearCart,
} = require("../controllers/cartController");
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping Cart Management
 */

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add an item to the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *             properties:
 *               userId:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Invalid request
 */
router.post("/add", addToCart);

/**
 * @swagger
 * /cart/get/{userId}:
 *   get:
 *     summary: Get cart items for a specific user
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of cart items for the user
 *       404:
 *         description: No cart items found
 */
router.get("/get/:userId", getCartByUserId);

/**
 * @swagger
 * /cart/delete/{id}:
 *   delete:
 *     summary: Delete a specific item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Cart item ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted from cart
 *       404:
 *         description: Cart item not found
 */
router.delete("/delete", deleteCartItem);

router.post("/clear", clearCart);


module.exports = router;
