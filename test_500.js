import { createPet } from './controllers/petsController.js';
import fs from 'fs';

const mockReq = {
  auth: { userId: 'user_123' },
  body: { type: 'Dog', description: 'Test', location: 'NYC', status: 'missing' },
  file: {
    buffer: Buffer.from('mock image data'),
    mimetype: 'image/jpeg',
    originalname: 'test.jpg'
  }
};

const mockRes = {
  status: (code) => {
    console.log('Status set:', code);
    return mockRes;
  },
  json: (data) => console.log('Response:', data)
};

async function test() {
  try {
     console.log('--- Invoking createPet ---');
     await createPet(mockReq, mockRes);
  } catch(e) {
     console.error('CRASH:', e);
  }
  process.exit(0);
}
test();
