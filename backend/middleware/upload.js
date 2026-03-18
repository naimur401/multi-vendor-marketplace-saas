import multer from 'multer';
import { logger } from '../utils/logger.js';

// Store files in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Invalid file type attempted to upload: ${file.mimetype}`);
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB max file size
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});

export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        error: { message: 'File size exceeds 5MB limit', statusCode: 400 },
      });
    }
  }

  if (err) {
    logger.error('Upload error:', err);
    return res.status(400).json({
      error: { message: err.message, statusCode: 400 },
    });
  }

  next();
};
