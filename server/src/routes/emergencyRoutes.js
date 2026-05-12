const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// Create emergency request
router.post('/create', emergencyController.createEmergency);

// Get all emergencies
router.get('/all', emergencyController.getAllEmergencies);

// Get user emergencies — must be BEFORE /:id to avoid conflict
router.get('/user/:userId', emergencyController.getUserEmergencies);

// Get emergency by ID
router.get('/:id', emergencyController.getEmergencyById);

// Update emergency status
router.put('/:id/status', emergencyController.updateEmergencyStatus);

// Update location
router.post('/:id/location', emergencyController.updateLocation);

module.exports = router;
