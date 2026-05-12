const multer = require('multer');
const path = require('path');
const pool = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const uploadController = {
  upload: upload.single('file'),

  handleUpload: async (req, res) => {
    try {
      const { type, emergencyId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const result = await pool.query(
        `INSERT INTO emergency_files (emergency_id, file_type, file_path, file_name, file_size)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [emergencyId, type, file.path, file.originalname, file.size]
      );

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  },

  getEmergencyFiles: async (req, res) => {
    try {
      const { emergencyId } = req.params;

      const result = await pool.query(
        'SELECT * FROM emergency_files WHERE emergency_id = $1 ORDER BY created_at DESC',
        [emergencyId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = uploadController;
