/**
 * Storage Service
 * Abstracted layer so we can swap out DataURIs for AWS S3 / Cloudinary easily after the hackathon.
 */
export const uploadImage = async (fileBuffer, mimeType) => {
  // Hackathon MVP Implementation: 
  // We keep costs to zero by using Base64 strings directly in the PostgreSQL DB.
  const base64Image = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Image}`;
  
  // Upgrade Path Implementation Example (Production):
  // const cloudinaryResponse = await cloudinary.uploader.upload(dataUri);
  // return cloudinaryResponse.secure_url;
  
  return dataUri; 
};
