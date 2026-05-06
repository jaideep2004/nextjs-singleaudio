import path from 'path';
import os from 'os';

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

// Server
export const PORT = process.env.PORT || 5000;
export const API_PREFIX = '/api';

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Roles
export enum UserRole {
  ARTIST = 'artist',
  LABEL = 'label',
  ADMIN = 'admin'
}

// File Upload
export const IS_SERVERLESS_RUNTIME = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
export const LOCAL_FFMPEG_ENABLED =
  !IS_PRODUCTION &&
  !IS_SERVERLESS_RUNTIME &&
  process.env.ENABLE_LOCAL_FFMPEG !== 'false';
export const UPLOAD_DIR = IS_SERVERLESS_RUNTIME
  ? path.join(os.tmpdir(), 'nextjs-singleaudio', 'uploads')
  : path.join(process.cwd(), 'uploads');
export const TRACKS_DIR = path.join(UPLOAD_DIR, 'tracks');
export const ARTWORK_DIR = path.join(UPLOAD_DIR, 'artwork');
export const REGISTRATION_DIR = path.join(UPLOAD_DIR, 'registration');
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for audio files

// Supported file types
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

// Release statuses
export enum ReleaseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Payout statuses
export enum PayoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Notification types
export enum NotificationType {
  RELEASE_APPROVED = 'release_approved',
  RELEASE_REJECTED = 'release_rejected',
  PAYOUT_APPROVED = 'payout_approved',
  PAYOUT_REJECTED = 'payout_rejected',
  SYSTEM = 'system'
}

// Payment methods
export enum PaymentMethod {
  UPI = 'upi',
  PAYPAL = 'paypal'
}

// Stores
export const STORES = [
  'Spotify',
  'Apple Music',
  'Amazon Music',
  'YouTube Music',
  'Deezer',
  'Tidal',
  'Pandora',
  'SoundCloud'
]; 
