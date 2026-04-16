import axios from 'axios';
import FormData from 'form-data';

/**
 * ML Service Handler
 * Abstracts connections to external ML systems. Currently pings our local FastAPI,
 * but easily upgradable to OpenAI / HuggingFace Inference Endpoints later.
 */
export const generateEmbedding = async (fileBuffer, originalName, mimeType) => {
  try {
    const formData = new FormData();
    // FormData allows us to proxy the file buffer securely over a POST request
    // CRITICAL FIX: explicitly supply the filename and contentType, otherwise Python FastAPI will reject the Raw Buffer stream or PIL will crash.
    formData.append('file', fileBuffer, {
       filename: originalName || 'upload.jpg',
       contentType: mimeType || 'image/jpeg'
    });

    // Default to the localhost python server we built in phase 2
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000/embed';
    
    // Fire the API call
    const response = await axios.post(mlUrl, formData, {
      headers: { ...formData.getHeaders() }
    });

    if (response.data.status !== 'success') {
      throw new Error('ML API failed processing');
    }

    return response.data.embedding; // 512 dimensions array
  } catch (error) {
    if (error.response) {
      console.error("ML Service Payload Error:", JSON.stringify(error.response.data));
      throw new Error(`ML Service Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error("ML Service Connection Error:", error.message);
      throw new Error(`ML Connection Error: ${error.message} (Is your Python server running?)`);
    }
  }
};
