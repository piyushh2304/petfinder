import multer from 'multer';

// Multer is used to parse multipart/form-data requests (useful for file uploads).
// For the MVP, we explicitly store the uploaded image buffer in memory.
// This allows us quick access to the buffer to shoot it to the Python ML server.
const upload = multer({ storage: multer.memoryStorage() });

export default upload;
