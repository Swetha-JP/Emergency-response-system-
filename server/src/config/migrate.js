const pool = require('./database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Agencies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Emergency requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emergency_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        emergency_type VARCHAR(50) NOT NULL,
        description TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_agency_id INTEGER REFERENCES agencies(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      );
    `);

    // Emergency updates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emergency_updates (
        id SERIAL PRIMARY KEY,
        emergency_id INTEGER REFERENCES emergency_requests(id),
        agency_id INTEGER REFERENCES agencies(id),
        status VARCHAR(50) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Location tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS location_tracking (
        id SERIAL PRIMARY KEY,
        emergency_id INTEGER REFERENCES emergency_requests(id),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Emergency files table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emergency_files (
        id SERIAL PRIMARY KEY,
        emergency_id INTEGER REFERENCES emergency_requests(id),
        file_type VARCHAR(50) NOT NULL,
        file_path TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Emergency contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        relationship VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Chat messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        emergency_id INTEGER REFERENCES emergency_requests(id),
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Path tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS path_tracking (
        id SERIAL PRIMARY KEY,
        emergency_id INTEGER REFERENCES emergency_requests(id),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        accuracy DECIMAL(10, 2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Risk zones table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS risk_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        radius INTEGER NOT NULL,
        risk_level VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
