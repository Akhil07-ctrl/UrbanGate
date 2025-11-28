import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Folder in Cloudinary to store the file
 * @returns {Promise<Object>} - Upload result from Cloudinary
 */
const uploadToCloudinary = async (filePath, folder = 'urbangate') => {
  try {
    if (!filePath) {
      throw new Error('File path is required');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    const resourceType = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) 
      ? 'image' 
      : 'raw';

    const options = {
      folder: `${process.env.NODE_ENV || 'development'}/${folder}`,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // Upload file
    const result = await cloudinary.uploader.upload(filePath, options);

    // Clean up the temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Error deleting temporary file ${filePath}:`, error);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Clean up the temporary file in case of error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Type of resource ('image', 'video', 'raw')
 * @returns {Promise<Object>} - Deletion result from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });

    if (result.result !== 'ok') {
      console.warn(`Failed to delete ${publicId}:`, result);
    }

    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {string[]} publicIds - Array of public IDs to delete
 * @param {string} resourceType - Type of resource ('image', 'video', 'raw')
 * @returns {Promise<Array>} - Array of deletion results
 */
const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    publicIds.map(id => deleteFromCloudinary(id, resourceType))
  );

  // Log any errors
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Error deleting ${publicIds[index]}:`, result.reason);
    }
  });

  return results;
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file paths or file objects with path property
 * @param {string} folder - Folder in Cloudinary to store the files
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleToCloudinary = async (files = [], folder = 'urbangate') => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(file => {
    const filePath = file.path || file;
    return uploadToCloudinary(filePath, folder).catch(error => {
      console.error(`Error uploading ${filePath}:`, error);
      return { error: error.message, file: filePath };
    });
  });

  return Promise.all(uploadPromises);
};

export {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  uploadMultipleToCloudinary,
  cloudinary,
};
