import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Import external configs & routes using ESM syntax (notice the .js extensions are required in native ES modules)
import pool from './config/db.js'; 
import apiRoutes from './routes/api.js'; 

const app = express();
const port = process.env.PORT || 3001;

// --- Global Middlewares ---
app.use(cors());
app.use(express.json()); 

// --- Mount Routes ---
// Any incoming URL starting with "/api" is forwarded to our apiRoutes handler
app.use('/api', apiRoutes);

// General catch-all root check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Missing Pet Vector-Matching API' });
});

// --- Server Startup ---
app.listen(port, () => {
  console.log(`Backend Express server running using ES Modules on http://localhost:${port}`);
});
