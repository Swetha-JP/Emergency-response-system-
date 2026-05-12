const pool = require('../config/database');

const contactsController = {
  getContacts: async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        'SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  addContact: async (req, res) => {
    try {
      const { userId, name, phone, email, relationship } = req.body;

      const result = await pool.query(
        `INSERT INTO emergency_contacts (user_id, name, phone, email, relationship)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, name, phone, email, relationship]
      );

      res.status(201).json({
        success: true,
        message: 'Contact added successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateContact: async (req, res) => {
    try {
      const { contactId } = req.params;
      const { name, phone, email, relationship } = req.body;

      const result = await pool.query(
        `UPDATE emergency_contacts 
         SET name = $1, phone = $2, email = $3, relationship = $4
         WHERE id = $5
         RETURNING *`,
        [name, phone, email, relationship, contactId]
      );

      res.json({
        success: true,
        message: 'Contact updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteContact: async (req, res) => {
    try {
      const { contactId } = req.params;

      await pool.query('DELETE FROM emergency_contacts WHERE id = $1', [contactId]);

      res.json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  notifyContacts: async (req, res) => {
    try {
      const { userId, emergencyData } = req.body;

      const contacts = await pool.query(
        'SELECT * FROM emergency_contacts WHERE user_id = $1',
        [userId]
      );

      const trackingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/track/${emergencyData.emergencyId}`;

      // In production: send real SMS/Email via Twilio / SendGrid
      // For now we return the link and contacts so the frontend can display it
      console.log('=== FAMILY NOTIFICATION ===');
      contacts.rows.forEach(c => {
        console.log(`Notifying ${c.name} (${c.phone}) — tracking link: ${trackingLink}`);
      });

      res.json({
        success: true,
        message: 'Contacts notified',
        notified: contacts.rows.length,
        contacts: contacts.rows,
        trackingLink
      });
    } catch (error) {
      console.error('Error notifying contacts:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = contactsController;
