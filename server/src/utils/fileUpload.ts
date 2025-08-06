import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { 
  TRACKS_DIR, 
  ARTWORK_DIR, 
  MAX_FILE_SIZE,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES
} from '../config/constants';
import { ApiError } from '../middleware/errorHandler.middleware';

// Ensure upload directories exist
[TRACKS_DIR, ARTWORK_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for audio files
const audioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TRACKS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Configure storage for image files
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ARTWORK_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter for audio files
const audioFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(`Invalid file type. Allowed types: ${ALLOWED_AUDIO_TYPES.join(', ')}`, 400));
  }
};

// File filter for image files
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`, 400));
  }
};

// Configure upload for audio files
export const uploadAudio = multer({
  storage: audioStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: audioFileFilter
});

// Configure upload for image files
export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFileFilter
});

// Delete file
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Get file URL (in a real app, this would be a CDN or S3 URL)
export const getFileUrl = (filename: string, type: 'audio' | 'image'): string => {
  const baseUrl = process.env.API_URL || 'http://localhost:5000';
  const directory = type === 'audio' ? 'tracks' : 'artwork';
  return `${baseUrl}/uploads/${directory}/${filename}`;
}; 