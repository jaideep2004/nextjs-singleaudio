import { Router } from 'express';
import { uploadAudio, uploadImage, getFileUrl } from '../utils/fileUpload';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';

const router = Router();

// Upload artwork image
router.post(
  '/artwork',
  protect,
  authorize([UserRole.ARTIST, UserRole.ADMIN]),
  uploadImage.single('artwork'),
  (req, res) => {
  // @ts-ignore multer adds file
  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ success: false, error: 'No artwork file provided' });
  }
  const filename = file.filename;
  const url = getFileUrl(filename, 'image');
  return res.json({ success: true, filename, url });
  }
);

// Upload audio file
router.post(
  '/audio',
  protect,
  authorize([UserRole.ARTIST, UserRole.ADMIN]),
  uploadAudio.single('audio'),
  (req, res) => {
  // @ts-ignore multer adds file
  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ success: false, error: 'No audio file provided' });
  }
  const filename = file.filename;
  const url = getFileUrl(filename, 'audio');
  return res.json({ success: true, filename, url });
  }
);

export default router;
