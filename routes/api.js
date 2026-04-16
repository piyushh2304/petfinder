import express from 'express';

// Explicit named import from Clerk SDK as ESM supports it natively
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// Middlewares & Controllers
import upload from '../middlewares/upload.js';
import { createPet, getMatches, getMyPosts, getAllPets, deletePet } from '../controllers/petsController.js';

const router = express.Router();

// --- Public Health API ---
router.get('/status', (req, res) => {
  res.json({ message: 'Missing Pet API endpoints are live!' });
});

// --- Core Pet Tracking & Matching APIs ---

// 1. Upload a Pet
router.post('/pets', ClerkExpressWithAuth(), upload.single('image'), createPet);

// 2. Global Feed (Search by Location/Pincode)
router.get('/pets', ClerkExpressWithAuth(), getAllPets);

// 3. User Operations (Delete Post)
router.delete('/pets/:id', ClerkExpressWithAuth(), deletePet);

// 2. Dashboard - View everything I uploaded
router.get('/pets/my-posts', ClerkExpressWithAuth(), getMyPosts);

// 3. Engine - Core Vector similarity trigger
router.get('/pets/:petId/matches', ClerkExpressWithAuth(), getMatches);

export default router;
