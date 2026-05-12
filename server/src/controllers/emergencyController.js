const pool = require('../config/database');

// Haversine distance in km between two lat/lng points
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const emergencyController = {
  // Create new emergency request — auto-routes to nearest matching agency
  createEmergency: async (req, res) => {
    try {
      const { userId, emergencyType, description, latitude, longitude, priority } = req.body;

      // Find nearest active agency of the matching type
      let assignedAgencyId = null;
      try {
        const agencyResult = await pool.query(
          `SELECT id, latitude, longitude FROM agencies
           WHERE type = $1 AND is_active = true
           AND latitude IS NOT NULL AND longitude IS NOT NULL`,
          [emergencyType]
        );

        if (agencyResult.rows.length > 0) {
          let nearest = null;
          let minDist = Infinity;
          for (const agency of agencyResult.rows) {
            const dist = haversine(
              parseFloat(latitude), parseFloat(longitude),
              parseFloat(agency.latitude), parseFloat(agency.longitude)
            );
            if (dist < minDist) { minDist = dist; nearest = agency; }
          }
          if (nearest) assignedAgencyId = nearest.id;
        }
      } catch (routingErr) {
        console.warn('Auto-routing skipped:', routingErr.message);
      }

      const result = await pool.query(
        `INSERT INTO emergency_requests
           (user_id, emergency_type, description, latitude, longitude, priority, status, assigned_agency_id)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
         RETURNING *`,
        [userId, emergencyType, description, latitude, longitude, priority || 'medium', assignedAgencyId]
      );

      res.status(201).json({
        success: true,
        message: 'Emergency request created successfully',
        data: result.rows[0],
        autoAssigned: !!assignedAgencyId
      });
    } catch (error) {
      console.error('Error creating emergency:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get all emergencies
  getAllEmergencies: async (req, res) => {
    try {
      const { status } = req.query;
      let query = 'SELECT * FROM emergency_requests';
      let params = [];

      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get emergency by ID
  getEmergencyById: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate numeric ID
      if (isNaN(parseInt(id))) {
        return res.status(404).json({ success: false, message: 'Emergency not found' });
      }

      const result = await pool.query(
        'SELECT * FROM emergency_requests WHERE id = $1',
        [parseInt(id)]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Emergency not found' });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching emergency:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Update emergency status
  updateEmergencyStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, agencyId } = req.body;

      const result = await pool.query(
        `UPDATE emergency_requests 
         SET status = $1, assigned_agency_id = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, agencyId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Emergency not found' });
      }

      res.json({
        success: true,
        message: 'Emergency status updated',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating emergency:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Update location
  updateLocation: async (req, res) => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      await pool.query(
        'INSERT INTO location_tracking (emergency_id, latitude, longitude) VALUES ($1, $2, $3)',
        [id, latitude, longitude]
      );

      res.json({
        success: true,
        message: 'Location updated successfully'
      });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get user emergencies
  getUserEmergencies: async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        'SELECT * FROM emergency_requests WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching user emergencies:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = emergencyController;
