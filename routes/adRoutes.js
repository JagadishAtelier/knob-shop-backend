const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Advertisement Management APIs
 */

/**
 * @swagger
 * /ads/create:
 *   post:
 *     summary: Create a new advertisement
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adMode
 *               - title
 *               - adType
 *             properties:
 *               adMode:
 *                 type: string
 *                 enum: [single, multiple]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               adType:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               link:
 *                 type: string
 *               fromDate:
 *                 type: string
 *                 format: date
 *               toDate:
 *                 type: string
 *                 format: date
 *               ctaButton:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ad created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/create', adController.createAd);

/**
 * @swagger
 * /ads:
 *   get:
 *     summary: Get all advertisements
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: List of all ads
 */
router.get('/', adController.getAllAds);

/**
 * @swagger
 * /ads/{id}:
 *   get:
 *     summary: Get an advertisement by ID
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the ad to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ad found
 *       404:
 *         description: Ad not found
 */
router.get('/:id', adController.getAdById);

/**
 * @swagger
 * /ads/delete/{id}:
 *   delete:
 *     summary: Delete an advertisement by ID
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the ad to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ad deleted successfully
 *       404:
 *         description: Ad not found
 */
router.delete('/delete/:id', adController.deleteAd);


module.exports = router;
