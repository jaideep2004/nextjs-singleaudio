// @ts-ignore - No type definitions for fluent-ffmpeg
import ffmpeg from 'fluent-ffmpeg';

export interface AudioAnalysisResult {
  format: string;
  duration: number;
  bitrate: number;
  loudness?: number; // Placeholder for future
}

export function analyzeAudio(filePath: string): Promise<AudioAnalysisResult> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, metadata: any) => {
      if (err) return reject(err);
      const format = metadata.format.format_name || '';
      const duration = metadata.format.duration || 0;
      const bitrate = metadata.format.bit_rate ? parseInt(metadata.format.bit_rate, 10) / 1000 : 0;
      // Placeholder: loudness calculation can be added later
      resolve({ format, duration, bitrate });
    });
  });
}
