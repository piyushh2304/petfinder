import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

// Establish connection pool to NeonDB using the DATABASE_URL in .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to NeonDB:', err);
  } else {
    console.log('Connected to NeonDB successfully at:', res.rows[0].now);
  }
});

export default pool;
