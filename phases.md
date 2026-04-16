# Missing Pet Vector-Matching Network - MVP Plan

This document outlines the phased implementation plan for building the Missing Pet Vector-Matching Network MVP.

## Phase 1: Database setup & Foundation (NeonDB)
**Goal:** Establish the PostgreSQL database with the necessary extensions.
- Create a NeonDB project.
- Enable the `pgvector` extension on the database (`CREATE EXTENSION vector;`).
- Design and execute the schema for the `pets` table, including a vector column for the embeddings.
- Set up connection pooling strings and environment variables for the backend.

## Phase 2: Python ML Service (Embeddings)
**Goal:** Build a lightweight service to handle image embedding generation.
- Initialize a Python project (using FastAPI for a simple microservice approach).
- Integrate a pre-trained model (e.g., `clip-ViT-B-32` from Hugging Face `sentence-transformers`).
- Create an endpoint (`POST /embed`) that takes an uploaded image and returns the embedding vector.
- *Simplification:* Keep the model loaded in memory for fast inference on API calls.

## Phase 3: Node.js Backend & Auth Integration
**Goal:** Initialize the Express server and implement Clerk authentication.
- Setup a Node.js + Express project.
- Integrate the `@clerk/clerk-sdk-node` to verify incoming authentication tokens.
- Set up a database connection (using `pg` or an ORM like Drizzle/Prisma).
- Implement a basic file handling middleware configuration (e.g., `multer`) for managing incoming images.

## Phase 4: Core APIs & Matching Logic
**Goal:** Build out the core CRUD endpoints and vector similarity matching.
- **POST /pets:** 
  - Authenticate the user.
  - Upload the image to cloud storage or convert to base64.
  - Call the Python ML Service to get the vector embedding.
  - Save the record (metadata, user_id, type, location, vector) into NeonDB.
- **GET /pets/matches:** 
  - Fetch a specific pet's embedding.
  - Query NeonDB using cosine similarity (`<=>`) against pets of the opposite status.
  - Apply the scoring formula: `(0.7 * Visual Similarity) + (0.3 * Location Score)`.
- **GET /pets/my-posts:** Retrieve pets tied to the authenticated user.

## Phase 5: Python Frontend UI (Streamlit)
**Goal:** Build the user interface for interacting with the application.
- Initialize a Streamlit application.
- Implement Clerk authentication on the frontend (or a simplified session auth for the MVP context).
- Create the "Upload Missing / Found Pet" form requiring Image, Type, Description, and Location details.
- Create a user dashboard displaying "My Posts".
- Build the "Alerts / Matches" view that queries the backend to show high-probability matches.

## Phase 6: End-to-End Testing & Polish
**Goal:** Ensure the entire pipeline works seamlessly.
- Test uploading a missing pet and verifying the embedding is stored in PostgreSQL.
- Test uploading a found pet (with a similar image) and verify that it matches.
- Validate the location scoring logic (testing points nearby vs. far away).
- Refine UI responses, loading states, and match percentage display.
