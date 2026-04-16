import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function upgradeDatabase() {
  try {
    await client.connect();
    console.log("Connected to NeonDB successfully.");

    // Enable vector extension just in case it doesn't exist
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    
    // We must drop the table to change the vector sizing architecture natively and discard old 512d vectors
    await client.query("DROP TABLE IF EXISTS pets;");
    console.log("Dropped deprecated 512-d CLIP 'pets' table.");

    // Recreate with ResNet50 2048 dimension tracking
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
    console.log("Created sophisticated 'pets' table schema with ResNet50 vector(2048) support.");

  } catch (err) {
    console.error("Error upgrading the database:", err);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

upgradeDatabase();
