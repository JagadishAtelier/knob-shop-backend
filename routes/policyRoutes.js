const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');

// Route to get the latest published version
router.get('/:title', policyController.getLatestPublishedVersion);

// Route to get all versions
router.get('/:title/versions', policyController.getVersionHistory);

// Route to add a new version
router.post('/:title', policyController.addNewVersion);

module.exports = router;
