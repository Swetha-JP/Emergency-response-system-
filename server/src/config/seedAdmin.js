const pool = require('./database');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const email = 'admin@emergency.com';

    // Check if admin already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('✅ Admin already exists:', email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, user_type)
       VALUES ($1, $2, $3, $4, $5)`,
      ['Central Admin', email, '0000000000', passwordHash, 'admin']
    );

    console.log('✅ Admin user created successfully');
    console.log('   Email   : admin@emergency.com');
    console.log('   Password: admin123');
    console.log('   Role    : admin');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
