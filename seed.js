import pool from './config/db.js';
import axios from 'axios';
import FormData from 'form-data';

async function seedDatabase() {
  console.log("Engaging Autonomous Seed Sequence. Generating artificial intelligence tracking metrics for 3 demo pets...");

  const pets = [
    { 
      type: 'Dog', status: 'missing', location: 'New York (10001)', 
      desc: 'Missing Golden Retriever with blue collar.', 
      imgUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      type: 'Dog', status: 'found', location: 'New York (10001)', 
      desc: 'Found a stray Golden Retriever near Central Park! Looks similar to a missing poster.', 
      imgUrl: 'https://images.unsplash.com/photo-1537151608804-ea2d15a15fbf?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      type: 'Cat', status: 'missing', location: 'Los Angeles (90210)', 
      desc: 'Orange tabby cat lost near Beverly Hills. Very friendly but easily spooked.', 
      imgUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop' 
    }
  ];

  for (const pet of pets) {
     try {
         // 1. Download realistic image
         const imgRes = await axios.get(pet.imgUrl, { responseType: 'arraybuffer' });
         
         // 2. Submit physical bytes to standalone ML Server for YOLO + ResNet Processing
         const form = new FormData();
         form.append('file', imgRes.data, { filename: 'pet.jpg', contentType: 'image/jpeg' });
         
         console.log(`Extracting 2048-dimensional features for: ${pet.desc.substring(0, 30)}...`);
         const pyRes = await axios.post('http://localhost:8000/embed', form, { headers: form.getHeaders() });
         const embedding = pyRes.data.embedding;

         const vectorStr = `[${embedding.join(',')}]`;
         
         // 3. Inject highly accurate math vector directly into Network grid
         const query = `
            INSERT INTO pets (user_id, type, description, location, status, image_url, embedding) 
            VALUES ('system_seed_ai', $1, $2, $3, $4, $5, $6)
         `;
         await pool.query(query, [pet.type, pet.desc, pet.location, pet.status, pet.imgUrl, vectorStr]);
         console.log(`[SUCCESS] Radar Target Integrated -> ${pet.location}`);
     } catch (err) {
         console.error('Seed failure:', err.message);
     }
  }
  
  console.log("Global Simulation Seed Complete!");
  process.exit(0);
}

seedDatabase();
