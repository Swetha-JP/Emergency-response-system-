const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/heatmap', analyticsController.getHeatmap);
router.get('/response-time/:agencyId', analyticsController.getResponseTime);
router.get('/statistics', analyticsController.getStatistics);
router.post('/report', analyticsController.generateReport);
router.get('/nearby', analyticsController.getNearbyIncidents);

module.exports = router;
