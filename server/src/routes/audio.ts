import express from 'express';
import multer from 'multer';
import path from 'path';
import { analyzeAudioHandler } from '../controllers/audioController';

const router = express.Router();

// Use multer for file uploads
const upload = multer({ dest: path.join(__dirname, '../../uploads') });

// POST /api/audio/analyze
router.post('/analyze', upload.single('file'), analyzeAudioHandler);

export default router;
    