import pool from './config/db.js';
import axios from 'axios';
import FormData from 'form-data';

// Fast array of standard stock images
const dogImages = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800',
  'https://images.unsplash.com/photo-1537151608804-ea2d15a15fbf?q=80&w=800',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800'
];

const catImages = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800',
  'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=800',
  'https://images.unsplash.com/photo-1529778459816-3e110cb1ee6d?q=80&w=800',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=800',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=800'
];

const locations = ['New York (10001)', 'Los Angeles (90210)', 'Chicago (60601)', 'Austin (73301)', 'Seattle (98101)', 'Miami (33101)'];

function randomEl(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function fetchBaseVector(imgUrl) {
  const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
  const form = new FormData();
  form.append('file', imgRes.data, { filename: 'pet.jpg', contentType: 'image/jpeg' });
  const pyRes = await axios.post('http://localhost:8000/embed', form, { headers: form.getHeaders() });
  return pyRes.data.embedding;
}

// Generate Mathematical Clone with artificial noise to simulate real varying camera angles
function cloneWithJitter(baseVec) {
  return baseVec.map(v => v + ((Math.random() - 0.5) * 0.05));
}

async function bulkSeed() {
  console.log("Analyzing architectural templates through Python ResNet Core...");
  
  const baseDog = await fetchBaseVector(dogImages[0]);
  const baseCat = await fetchBaseVector(catImages[0]);

  console.log("Templates locked. Initiating Hyper-Speed Multi-Threaded Seeding for 200 nodes...");
  
  let successCount = 0;
  for (let i = 0; i < 200; i++) {
     const isDog = i < 100;
     const type = isDog ? 'Dog' : 'Cat';
     const status = Math.random() > 0.5 ? 'missing' : 'found';
     const loc = randomEl(locations);
     const imgUrl = isDog ? randomEl(dogImages) : randomEl(catImages);
     const desc = `Generated tracking target. Entity identified as ${type} in ${loc.split(' ')[0]}. Automated global simulation system check.`;
     
     // Mathematically generate realistic 2048 vector via noise jittering
     const vec = cloneWithJitter(isDog ? baseDog : baseCat);
     const vectorStr = `[${vec.join(',')}]`;

     const query = `
        INSERT INTO pets (user_id, type, description, location, status, image_url, embedding) 
        VALUES ('system_seed_ai_200', $1, $2, $3, $4, $5, $6)
     `;
     
     try {
       await pool.query(query, [type, desc, loc, status, imgUrl, vectorStr]);
       successCount++;
       if (successCount % 20 === 0) console.log(`[STATUS] Successfully routed ${successCount}/200 Radar Entities into Postgres.`);
     } catch (e) {
       console.error("Failed to insert entity", e.message);
     }
  }

  console.log("Global Simulation Seed (200 entities) Complete!");
  process.exit(0);
}

bulkSeed().catch(console.error);
