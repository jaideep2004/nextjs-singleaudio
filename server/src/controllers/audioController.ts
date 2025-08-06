import { Request, Response } from 'express';
import path from 'path';
import { analyzeAudio } from '../services/audioAnalysisService';

export async function analyzeAudioHandler(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const result = await analyzeAudio(filePath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
