const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, phone, password, userType } = req.body;

      // Check if user exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, user_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, phone, user_type, created_at`,
        [name, email, phone, passwordHash, userType]
      );

      // Generate token
      const token = jwt.sign(
        { id: result.rows[0].id, userType: result.rows[0].user_type },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Login user — role is auto-detected from DB, no userType needed from client
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Check users table first (tourist / agency / admin)
      const userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, userType: user.user_type },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            userType: user.user_type
          }
        });
      }

      // 2. Fall back to agencies table (plain-text password legacy support)
      const agencyResult = await pool.query(
        'SELECT * FROM agencies WHERE email = $1',
        [email]
      );

      if (agencyResult.rows.length > 0) {
        const agency = agencyResult.rows[0];

        if (password !== (agency.password_hash || agency.password)) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: agency.id, userType: 'agency', agencyType: agency.type },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: agency.id,
            name: agency.name,
            email: agency.email,
            phone: agency.phone,
            userType: 'agency',
            agencyType: agency.type
          }
        });
      }

      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT id, name, email, phone, user_type, created_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Admin: Get all users
  getAllUsers: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, phone, user_type, created_at FROM users ORDER BY created_at DESC'
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Admin: Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = authController;
