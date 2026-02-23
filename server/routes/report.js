const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Get report for specific locale
router.get('/:locale', reportController.getReportByLocale);

// Get summary across all locales
router.get('/', reportController.getSummary);

// Compare multiple locales
router.get('/compare/:locales', reportController.compareLocales);

module.exports = router;
