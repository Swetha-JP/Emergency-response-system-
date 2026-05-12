const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const wildlifeController = require('../controllers/wildlifeController');

// Multer config — save to uploads/wildlife/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = `wildlife_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/report',          upload.single('image'), wildlifeController.createReport);
router.get('/reports',          wildlifeController.getAllReports);
router.get('/my-reports',       wildlifeController.getMyReports);
router.put('/update-status/:id',wildlifeController.updateStatus);

module.exports = router;
