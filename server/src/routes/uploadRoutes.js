const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/', uploadController.upload, uploadController.handleUpload);
router.get('/emergency/:emergencyId', uploadController.getEmergencyFiles);

module.exports = router;
