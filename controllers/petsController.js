import pool from '../config/db.js';
import { generateEmbedding } from '../services/mlService.js';
import { uploadImage } from '../services/storageService.js';

/**
 * 1. CREATE PET (Missing or Found)
 */
export const createPet = async (req, res) => {
  try {
    const { type, description, location, status } = req.body;
    const userId = req.auth?.userId;

    // Standard guard clauses
    if (!userId) return res.status(401).json({ error: "Missing authentication" });
    if (!req.file) return res.status(400).json({ error: "Image file is required" });
    if (!type || !location || !status) return res.status(400).json({ error: "Missing required tracking fields" });

    if (status === 'found') {
       // Return immediately so the user isn't stuck waiting for the heavy PyTorch execution
       res.status(202).json({ message: "Successfully uploaded! Neural matrix generating in the background." });
       
       // Execute asynchronous ML model and dataset tracking
       (async () => {
           try {
             const imageUrl = await uploadImage(req.file.buffer, req.file.mimetype);
             const embedding = await generateEmbedding(req.file.buffer, req.file.originalname, req.file.mimetype);
             const embeddingString = `[${embedding.join(',')}]`;
             const insertQuery = `
               INSERT INTO pets (user_id, type, description, location, image_url, embedding, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
             `;
             await pool.query(insertQuery, [userId, type, description, location, imageUrl, embeddingString, status]);
           } catch(e) {
             console.error("Background ML Failure [Found]:", e);
           }
       })();
       
       return; // Stop synchronous execution here
    }

    // Step A: Store the image (Synchronous for Missing pets)
    const imageUrl = await uploadImage(req.file.buffer, req.file.mimetype);

    // Step B: Generate pgvector embeddings (Synchronous to provide immediate matches)
    const embedding = await generateEmbedding(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Format array for pgvector ([0.1, 0.2, ...])
    const embeddingString = `[${embedding.join(',')}]`;

    // Step C: Save safely using parameterized queries
    const insertQuery = `
      INSERT INTO pets (user_id, type, description, location, image_url, embedding, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at;
    `;
    const values = [userId, type, description, location, imageUrl, embeddingString, status];
    const { rows } = await pool.query(insertQuery, values);
    const newPetId = rows[0].id;

    // Step D: Instant Vector Match Execution (The WOW Factor)
    // missing -> scans found
    const searchStatus = 'found';
    const matchQuery = `
      SELECT 
        id, type, description, location, status, image_url, created_at,
        1 - (embedding <=> $1::vector) AS visual_similarity,
        CASE WHEN location ILIKE $2 THEN 1.0 ELSE 0.0 END AS location_similarity,
        (0.7 * (1 - (embedding <=> $1::vector))) + (0.3 * (CASE WHEN location ILIKE $2 THEN 1.0 ELSE 0.0 END)) AS final_score
      FROM pets
      WHERE status = $3 AND type ILIKE $4 AND id != $5
      ORDER BY final_score DESC
      LIMIT 5;
    `;
    const matchValues = [embeddingString, location, searchStatus, type, newPetId];
    const matchResults = await pool.query(matchQuery, matchValues);

    res.status(201).json({ 
      message: `Lost pet broadcasted successfully!`, 
      petId: newPetId,
      matches: matchResults.rows
    });

  } catch (error) {
    console.error("Controller Error [createPet]:", error.stack || error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Internal server error connecting to ML and DB." });
    }
  }
};

/**
 * 2. GET MATHEMATICAL VECTOR MATCHES
 * Core Phase 4 Logic
 */
export const getMatches = async (req, res) => {
  try {
    const { petId } = req.params;

    // Step A: Fetch target vector
    const petQuery = await pool.query('SELECT embedding, status, location, type FROM pets WHERE id = $1', [petId]);
    if (petQuery.rows.length === 0) return res.status(404).json({ error: "Pet not found" });

    const targetPet = petQuery.rows[0];
    
    // We only want to search 'found' pets if we uploaded a 'missing' one, and vice versa.
    const searchStatus = targetPet.status === 'missing' ? 'found' : 'missing';

    // Step B: Pgvector mathematical query execution
    // formula: (0.7 * (1 - (embedding <=> target))) + (0.3 * (location_match))
    // We explicitly exclude the searched pet_id itself
    const matchQuery = `
      SELECT 
        id, type, description, location, status, image_url, created_at,
        1 - (embedding <=> $1::vector) AS visual_similarity,
        CASE WHEN location ILIKE $2 THEN 1.0 ELSE 0.0 END AS location_similarity,
        (0.7 * (1 - (embedding <=> $1::vector))) + (0.3 * (CASE WHEN location ILIKE $2 THEN 1.0 ELSE 0.0 END)) AS final_score
      FROM pets
      WHERE status = $3 AND type ILIKE $4 AND id != $5
      ORDER BY final_score DESC
      LIMIT 10;
    `;

    const matchValues = [targetPet.embedding, targetPet.location, searchStatus, targetPet.type, petId];
    const { rows } = await pool.query(matchQuery, matchValues);

    res.json({ 
      target_pet_status: targetPet.status, 
      applied_weights: "0.7 Visual | 0.3 Location",
      matches: rows 
    });

  } catch (error) {
    console.error("Controller Error [getMatches]:", error);
    res.status(500).json({ error: "Failed to process similarity network." });
  }
};

/**
 * 3. MY POSTS DASHBOARD
 */
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Missing authentication" });

    const query = `
      SELECT id, type, description, location, status, image_url, created_at
      FROM pets
      WHERE user_id = $1 AND is_active = TRUE
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    
    res.json({ posts: rows });
  } catch (error) {
    console.error("Controller Error [getMyPosts]:", error);
    res.status(500).json({ error: "Failed to fetch user posts." });
  }
};

/**
 * 4. GLOBAL FEED (Location/Pincode filtering)
 */
export const getAllPets = async (req, res) => {
  try {
    const { location, status } = req.query;
    
    let queryArgs = [];
    let queryConditions = ["is_active = TRUE"]; // Only show logically active pets to the public

    if (location) {
      queryArgs.push(`%${location}%`);
      queryConditions.push(`location ILIKE $${queryArgs.length}`);
    }
    
    if (status) {
      queryArgs.push(status);
      queryConditions.push(`status = $${queryArgs.length}`);
    }

    const query = `
      WITH UniquePets AS (
        SELECT DISTINCT ON (image_url) id, user_id, type, description, location, status, image_url, created_at
        FROM pets
        WHERE ${queryConditions.join(" AND ")}
        ORDER BY image_url, created_at DESC
      )
      SELECT * FROM UniquePets
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    const { rows } = await pool.query(query, queryArgs);
    res.json({ pets: rows });

  } catch (error) {
    console.error("Controller Error [getAllPets]:", error);
    res.status(500).json({ error: "Failed to fetch global pet feed." });
  }
};

/**
 * 5. SOFT DELETE PET
 * Archives the visual data from public feeds but mathematically preserves the Vector for Deep Radar training scans.
 */
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;
    
    if (!userId) return res.status(401).json({ error: 'Missing authentication' });

    // Explicitly update only if the user making the request actually owns the entity
    const query = `UPDATE pets SET is_active = FALSE WHERE id = $1 AND user_id = $2 RETURNING id;`;
    const { rows } = await pool.query(query, [id, userId]);

    if (rows.length === 0) {
       return res.status(403).json({ error: "Access Denied. You do not own this tracking entity." });
    }

    res.json({ message: "Entity successfully wiped from global broadcast, retaining deep mathematical vector." });
    
  } catch (error) {
    console.error("Controller Error [deletePet]:", error);
    res.status(500).json({ error: "Failed to securely wipe entity." });
  }
};
