const pool = require('../config/database');
const PDFDocument = require('pdfkit');

const analyticsController = {
  getHeatmap: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT latitude, longitude, COUNT(*) as count
         FROM emergency_requests
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY latitude, longitude`
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching heatmap:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getResponseTime: async (req, res) => {
    try {
      const { agencyId } = req.params;

      const result = await pool.query(
        `SELECT 
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_response_time,
          MIN(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as min_response_time,
          MAX(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as max_response_time
         FROM emergency_requests
         WHERE assigned_agency_id = $1 AND status = 'accepted'`,
        [agencyId]
      );

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching response time:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getStatistics: async (req, res) => {
    try {
      const totalIncidents = await pool.query('SELECT COUNT(*) FROM emergency_requests');
      const activeIncidents = await pool.query('SELECT COUNT(*) FROM emergency_requests WHERE status = $1', ['pending']);
      const resolvedIncidents = await pool.query('SELECT COUNT(*) FROM emergency_requests WHERE status = $1', ['resolved']);

      const byType = await pool.query(
        `SELECT emergency_type, COUNT(*) as count
         FROM emergency_requests
         GROUP BY emergency_type`
      );

      res.json({
        success: true,
        data: {
          total: parseInt(totalIncidents.rows[0].count),
          active: parseInt(activeIncidents.rows[0].count),
          resolved: parseInt(resolvedIncidents.rows[0].count),
          byType: byType.rows
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  generateReport: async (req, res) => {
    try {
      const { type, filters } = req.body;

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);

      doc.pipe(res);

      doc.fontSize(20).text('Emergency Platform Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Report Type: ${type}`);
      doc.text(`Generated: ${new Date().toLocaleString()}`);
      doc.moveDown();

      // Add report content based on type
      doc.text('Report content will be generated here based on filters');

      doc.end();
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getNearbyIncidents: async (req, res) => {
    try {
      const { latitude, longitude, radius } = req.query;

      // Simple distance calculation (for production, use PostGIS)
      const result = await pool.query(
        `SELECT *, 
         (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
         cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
         sin(radians(latitude)))) AS distance
         FROM emergency_requests
         WHERE status = 'pending'
         HAVING distance < $3
         ORDER BY distance`,
        [latitude, longitude, radius / 1000]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching nearby incidents:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = analyticsController;
