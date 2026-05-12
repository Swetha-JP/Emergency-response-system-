const pool = require('./database');

const createWildlifeTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wildlife_reports (
        report_id   SERIAL PRIMARY KEY,
        user_id     INTEGER REFERENCES users(id),
        image_url   TEXT NOT NULL,
        incident_type VARCHAR(50) NOT NULL,
        description TEXT,
        latitude    DECIMAL(10,8),
        longitude   DECIMAL(11,8),
        status      VARCHAR(20) DEFAULT 'Pending',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ wildlife_reports table created');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createWildlifeTable();
