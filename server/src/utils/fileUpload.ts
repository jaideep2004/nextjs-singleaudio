import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { 
  TRACKS_DIR, 
  ARTWORK_DIR,
  REGISTRATION_DIR,
  SUPPORT_ATTACHMENT_DIR,
  MAX_FILE_SIZE,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_SUPPORT_ATTACHMENT_TYPES,
  SUPPORT_ATTACHMENT_MAX_FILE_SIZE
} from '../config/constants';
import { ApiError } from '../middleware/errorHandler.middleware';

// Ensure upload directories exist
[TRACKS_DIR, ARTWORK_DIR, REGISTRATION_DIR, SUPPORT_ATTACHMENT_DIR].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown upload directory error';
    throw new Error(`Failed to initialize upload directory "${dir}": ${message}`);
  }
});

const createUniqueFilename = (file: Express.Multer.File) =>
  `${uuidv4()}${path.extname(file.originalname)}`;

const createStorage = (destination: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      cb(null, createUniqueFilename(file));
    }
  });

const audioStorage = createStorage(TRACKS_DIR);
const imageStorage = createStorage(ARTWORK_DIR);

const mixedTrackStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, TRACKS_DIR);
      return;
    }

    if (file.fieldname === 'artwork') {
      cb(null, ARTWORK_DIR);
      return;
    }

    cb(new ApiError(`Unsupported upload field: ${file.fieldname}`, 400), TRACKS_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, createUniqueFilename(file));
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

const trackUploadFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'audio') {
    audioFileFilter(req, file, cb);
    return;
  }

  if (file.fieldname === 'artwork') {
    imageFileFilter(req, file, cb);
    return;
  }

  cb(new ApiError(`Unsupported upload field: ${file.fieldname}`, 400));
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

export const uploadTrackFiles = multer({
  storage: mixedTrackStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: trackUploadFileFilter
});

const ALLOWED_REGISTRATION_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const registrationStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, REGISTRATION_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, createUniqueFilename(file));
  },
});

const registrationFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_REGISTRATION_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        `Invalid file type. Allowed types: ${ALLOWED_REGISTRATION_TYPES.join(', ')}`,
        400
      )
    );
  }
};

export const uploadRegistrationFiles = multer({
  storage: registrationStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: registrationFileFilter,
}).fields([
  { name: 'governmentIdFile', maxCount: 1 },
  { name: 'labelGovIdFile', maxCount: 1 },
  { name: 'incorporationCertFile', maxCount: 1 },
  { name: 'gstCertFile', maxCount: 1 },
  { name: 'aadhaarFrontFile', maxCount: 1 },
  { name: 'aadhaarBackFile', maxCount: 1 },
  { name: 'panCardFile', maxCount: 1 },
  { name: 'nationalIdFrontFile', maxCount: 1 },
  { name: 'nationalIdBackFile', maxCount: 1 },
]);

const supportAttachmentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, SUPPORT_ATTACHMENT_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, createUniqueFilename(file));
  },
});

const supportAttachmentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_SUPPORT_ATTACHMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new ApiError(
      `Invalid file type. Allowed types: ${ALLOWED_SUPPORT_ATTACHMENT_TYPES.join(', ')}`,
      400
    )
  );
};

export const uploadSupportAttachment = multer({
  storage: supportAttachmentStorage,
  limits: { fileSize: SUPPORT_ATTACHMENT_MAX_FILE_SIZE },
  fileFilter: supportAttachmentFileFilter,
});

// Delete file
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete file at ${filePath}:`, error);
  }
};

// Get file URL (in a real app, this would be a CDN or S3 URL)
export const getFileUrl = (filename: string, type: 'audio' | 'image' | 'support'): string => {
  const baseUrl = process.env.API_URL || 'http://localhost:5000';
  const directory = type === 'audio' ? 'tracks' : type === 'image' ? 'artwork' : 'support';
  return `${baseUrl}/uploads/${directory}/${filename}`;
}; 
