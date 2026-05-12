const pool = require('../config/database');

const agencyController = {
  // Get all agencies
  getAllAgencies: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM agencies WHERE is_active = true ORDER BY name'
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching agencies:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get agencies by type
  getAgenciesByType: async (req, res) => {
    try {
      const { type } = req.params;

      const result = await pool.query(
        'SELECT * FROM agencies WHERE type = $1 AND is_active = true',
        [type]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching agencies by type:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Accept emergency
  acceptEmergency: async (req, res) => {
    try {
      const { emergencyId } = req.params;
      const { agencyId } = req.body;

      const result = await pool.query(
        `UPDATE emergency_requests 
         SET status = 'accepted', assigned_agency_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [agencyId, emergencyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Emergency not found' });
      }

      // Log the update
      await pool.query(
        'INSERT INTO emergency_updates (emergency_id, agency_id, status, message) VALUES ($1, $2, $3, $4)',
        [emergencyId, agencyId, 'accepted', 'Emergency accepted by agency']
      );

      res.json({
        success: true,
        message: 'Emergency accepted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error accepting emergency:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get agency dashboard stats
  getAgencyStats: async (req, res) => {
    try {
      const { agencyId } = req.params;

      const activeCount = await pool.query(
        'SELECT COUNT(*) FROM emergency_requests WHERE assigned_agency_id = $1 AND status = $2',
        [agencyId, 'active']
      );

      const resolvedToday = await pool.query(
        `SELECT COUNT(*) FROM emergency_requests 
         WHERE assigned_agency_id = $1 AND status = $2 
         AND DATE(resolved_at) = CURRENT_DATE`,
        [agencyId, 'resolved']
      );

      const totalRequests = await pool.query(
        'SELECT COUNT(*) FROM emergency_requests WHERE assigned_agency_id = $1',
        [agencyId]
      );

      res.json({
        success: true,
        data: {
          activeCases: parseInt(activeCount.rows[0].count),
          resolvedToday: parseInt(resolvedToday.rows[0].count),
          totalRequests: parseInt(totalRequests.rows[0].count)
        }
      });
    } catch (error) {
      console.error('Error fetching agency stats:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Update emergency status
  updateEmergencyStatus: async (req, res) => {
    try {
      const { emergencyId } = req.params;
      const { status } = req.body;

      const result = await pool.query(
        `UPDATE emergency_requests 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, emergencyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Emergency not found' });
      }

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Create agency (admin)
  createAgency: async (req, res) => {
    try {
      const { name, type, contact_number, email, address, latitude, longitude } = req.body;
      const result = await pool.query(
        `INSERT INTO agencies (name, type, contact_number, email, address, latitude, longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [name, type, contact_number, email, address || '', latitude || null, longitude || null]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error creating agency:', error);
      res.status(500).json({ success: false, message: error.detail || 'Server error' });
    }
  },

  // Update agency (admin)
  updateAgency: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, contact_number, email, address } = req.body;
      const result = await pool.query(
        `UPDATE agencies SET name=$1, type=$2, contact_number=$3, email=$4, address=$5
         WHERE id=$6 RETURNING *`,
        [name, type, contact_number, email, address || '', id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ success: false, message: 'Agency not found' });
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error updating agency:', error);
      res.status(500).json({ success: false, message: error.detail || 'Server error' });
    }
  },

  // Toggle agency active status (admin)
  toggleAgencyStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `UPDATE agencies SET is_active = NOT is_active WHERE id=$1 RETURNING *`,
        [id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ success: false, message: 'Agency not found' });
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error toggling agency:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Delete agency (admin)
  deleteAgency: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM agencies WHERE id=$1', [id]);
      res.json({ success: true, message: 'Agency deleted' });
    } catch (error) {
      console.error('Error deleting agency:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = agencyController;
