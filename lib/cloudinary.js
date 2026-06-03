import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

export async function uploadBufferToCloudinary(fileBuffer, originalName, folder = 'soas_contracts') {
  const isWord = /\.(doc|docx)$/i.test(originalName);
  const uploadOptions = {
    folder,
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true
  };

  if (isWord) {
    uploadOptions.format = 'pdf';
    uploadOptions.pages = true;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    uploadStream.end(fileBuffer);
  });
}

export async function uploadDataUrlToCloudinary(dataUrl, folder = 'soas_contracts/signed') {
  return cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: 'raw',
    format: 'pdf',
    use_filename: true,
    unique_filename: true
  });
}

export async function deleteCloudinaryAsset(publicId, resourceType = 'image') {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
