import { cloudinary } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

export const uploadImage = async (fileBuffer, folderName, fileName) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `marketplace/${folderName}`,
          public_id: fileName,
          resource_type: 'auto',
          transformation: [
            { width: 500, height: 500, crop: 'fill', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            logger.info(`File uploaded: ${fileName}`);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    logger.error('Upload image error:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (fileBuffers, folderName, fileNames) => {
  try {
    const uploadPromises = fileBuffers.map((buffer, index) =>
      uploadImage(buffer, folderName, fileNames[index])
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    logger.error('Upload multiple images error:', error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Delete image error:', error);
    throw error;
  }
};

export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) =>
      deleteImage(publicId)
    );

    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    logger.error('Delete multiple images error:', error);
    throw error;
  }
};

export const generateCloudinaryUrl = (publicId, transformations = {}) => {
  try {
    const defaultTransformations = {
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto',
      ...transformations,
    };

    return cloudinary.url(publicId, defaultTransformations);
  } catch (error) {
    logger.error('Generate URL error:', error);
    throw error;
  }
};
