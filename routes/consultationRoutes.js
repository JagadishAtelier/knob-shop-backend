// routes/consultationRoutes.js
const express = require('express');
const router = express.Router();
const { createConsultation, getConsultations } = require('../controllers/consultationController');

router.post('/consultation', createConsultation);
router.get('/consultation', getConsultations);

module.exports = router;
