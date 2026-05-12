const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');

// Get all agencies
router.get('/all', agencyController.getAllAgencies);

// Get agency by type
router.get('/type/:type', agencyController.getAgenciesByType);

// Accept emergency
router.post('/accept/:emergencyId', agencyController.acceptEmergency);

// Update emergency status
router.put('/status/:emergencyId', agencyController.updateEmergencyStatus);

// Get agency dashboard stats
router.get('/stats/:agencyId', agencyController.getAgencyStats);

// Admin CRUD
router.post('/create', agencyController.createAgency);
router.put('/update/:id', agencyController.updateAgency);
router.patch('/toggle/:id', agencyController.toggleAgencyStatus);
router.delete('/delete/:id', agencyController.deleteAgency);

module.exports = router;
