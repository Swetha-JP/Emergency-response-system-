const pool = require('../config/database');
const path = require('path');

const wildlifeController = {

  // POST /api/wildlife/report
  createReport: async (req, res) => {
    try {
      const { userId, incidentType, description, latitude, longitude } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image is required' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        `INSERT INTO wildlife_reports (user_id, image_url, incident_type, description, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, imageUrl, incidentType, description || null, latitude || null, longitude || null]
      );

      const report = result.rows[0];

      // Emit real-time notification to authorities
      const io = req.app.get('io');
      if (io) {
        io.emit('wildlife:new', {
          reportId: report.report_id,
          incidentType: report.incident_type,
          imageUrl: report.image_url,
          latitude: report.latitude,
          longitude: report.longitude,
          createdAt: report.created_at
        });
      }

      res.status(201).json({ success: true, message: 'Wildlife report submitted', data: report });
    } catch (err) {
      console.error('Wildlife report error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // GET /api/wildlife/reports  (admin — all)
  getAllReports: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT wr.*, u.name as user_name, u.phone as user_phone
         FROM wildlife_reports wr
         LEFT JOIN users u ON wr.user_id = u.id
         ORDER BY wr.created_at DESC`
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error('Get wildlife reports error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // GET /api/wildlife/my-reports?userId=X
  getMyReports: async (req, res) => {
    try {
      const { userId } = req.query;
      const result = await pool.query(
        `SELECT * FROM wildlife_reports WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error('Get my wildlife reports error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // PUT /api/wildlife/update-status/:id
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowed = ['Pending', 'Accepted', 'Rejected', 'Resolved'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const result = await pool.query(
        `UPDATE wildlife_reports SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE report_id = $2 RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const report = result.rows[0];

      // Notify user of status change
      const io = req.app.get('io');
      if (io) {
        io.emit(`wildlife:status:${report.user_id}`, {
          reportId: report.report_id,
          status: report.status
        });
      }

      res.json({ success: true, data: report });
    } catch (err) {
      console.error('Update wildlife status error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = wildlifeController;
