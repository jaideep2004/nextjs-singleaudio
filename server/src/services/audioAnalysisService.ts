// @ts-ignore - No type definitions for fluent-ffmpeg
import ffmpeg from 'fluent-ffmpeg';

// Allow configuring binary paths via environment variables (Windows-friendly)
// Set these in your server .env if ffmpeg/ffprobe are not on PATH
// FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
// FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe
try {
  const ffmpegPath = process.env.FFMPEG_PATH;
  const ffprobePath = process.env.FFPROBE_PATH;
  if (ffmpegPath && typeof (ffmpeg as any).setFfmpegPath === 'function') {
    (ffmpeg as any).setFfmpegPath(ffmpegPath);
  }
  if (ffprobePath && typeof (ffmpeg as any).setFfprobePath === 'function') {
    (ffmpeg as any).setFfprobePath(ffprobePath);
  }
} catch {
  // non-fatal; fluent-ffmpeg will try PATH
}

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
