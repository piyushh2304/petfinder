const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to NeonDB successfully.");

    // Enable vector extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("Enabled 'pgvector' extension.");

    // Create pets table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        image_url TEXT,
        embedding vector(2048),
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createTableQuery);
    console.log("Created 'pets' table schema with vector support.");

  } catch (err) {
    console.error("Error setting up the database:", err);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

setupDatabase();
