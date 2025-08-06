import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Track, { ITrack } from '../models/track.model';
import { successResponse, errorResponse, notFoundResponse } from '../utils/apiResponse';
import { ApiError } from '../middleware/errorHandler.middleware';
import { getFileUrl, deleteFile } from '../utils/fileUpload';
import { ReleaseStatus, TRACKS_DIR, ARTWORK_DIR, UserRole } from '../config/constants';
import * as notificationService from '../services/notification.service';

/**
 * Upload a new track
 * @route POST /api/tracks
 * @access Private (Artist)
 */
export const uploadTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, genre, releaseDate, isrc, stores } = req.body;
    const user = req.user;

    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files)) {
      throw new ApiError('Audio file and artwork are required', 400);
    }

    // Get file information
    let audioFile = '';
    let artwork = '';

    // @ts-ignore - multer types
    if (req.files['audio'] && req.files['audio'][0]) {
      // @ts-ignore - multer types
      audioFile = req.files['audio'][0].filename;
    } else {
      throw new ApiError('Audio file is required', 400);
    }

    // @ts-ignore - multer types
    if (req.files['artwork'] && req.files['artwork'][0]) {
      // @ts-ignore - multer types
      artwork = req.files['artwork'][0].filename;
    } else {
      throw new ApiError('Artwork is required', 400);
    }

    // Analyze audio for quality and loudness
    const audioPath = path.join(TRACKS_DIR, audioFile);
    let analysis: { format: string; duration: number; bitrate: number; loudness: number | null } = { format: '', duration: 0, bitrate: 0, loudness: null };
    try {
      const { analyzeAudio } = await import('../utils/audioAnalysis');
      analysis = await analyzeAudio(audioPath);
    } catch (err) {
      // If analysis fails, log but do not block upload
      console.error('Audio analysis failed:', err);
    }

    // Create track
    const track = await Track.create({
      title,
      artistId: user._id,
      artistName: user.artistName || user.name,
      genre,
      releaseDate,
      isrc,
      audioFile,
      artwork,
      stores: JSON.parse(stores),
      status: ReleaseStatus.PENDING,
      format: analysis.format,
      duration: analysis.duration,
      bitrate: analysis.bitrate,
      loudness: analysis.loudness
    });

    // Generate file URLs
    const audioUrl = getFileUrl(audioFile, 'audio');
    const artworkUrl = getFileUrl(artwork, 'image');

    successResponse(
      res,
      {
        ...track.toObject(),
        audioUrl,
        artworkUrl
      },
      'Track uploaded successfully. It will be reviewed by our team.',
      201
    );
  } catch (error) {
    // Clean up files if there was an error
    if (req.files) {
      // @ts-ignore - multer types
      if (req.files['audio'] && req.files['audio'][0]) {
        // @ts-ignore - multer types
        const audioPath = path.join(TRACKS_DIR, req.files['audio'][0].filename);
        deleteFile(audioPath);
      }
      // @ts-ignore - multer types
      if (req.files['artwork'] && req.files['artwork'][0]) {
        // @ts-ignore - multer types
        const artworkPath = path.join(ARTWORK_DIR, req.files['artwork'][0].filename);
        deleteFile(artworkPath);
      }
    }
    errorResponse(res, 'Failed to upload track', error);
  }
};

/**
 * Get all tracks
 * @route GET /api/tracks
 * @access Private
 */
export const getTracks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let tracks;

    // Filter tracks based on user role
    if (user.role === UserRole.ADMIN) {
      // Admins can see all tracks
      const statusFilter = req.query.status ? { status: req.query.status } : {};
      tracks = await Track.find(statusFilter).sort({ createdAt: -1 });
    } else {
      // Artists can only see their own tracks
      tracks = await Track.find({ artistId: user._id }).sort({ createdAt: -1 });
    }

    // Generate file URLs for each track
    const tracksWithUrls = tracks.map(track => {
      return {
        ...track.toObject(),
        audioUrl: getFileUrl(track.audioFile, 'audio'),
        artworkUrl: getFileUrl(track.artwork, 'image')
      };
    });

    successResponse(res, tracksWithUrls, 'Tracks retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Failed to retrieve tracks', error);
  }
};

/**
 * Get track by ID
 * @route GET /api/tracks/:id
 * @access Private
 */
export const getTrackById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    const track = await Track.findById(id);

    if (!track) {
      notFoundResponse(res, 'Track not found');
      return;
    }

    // Check if user is authorized to view this track
    if (user.role !== UserRole.ADMIN && track.artistId.toString() !== user._id.toString()) {
      throw new ApiError('Not authorized to access this track', 403);
    }

    // Generate file URLs
    const audioUrl = getFileUrl(track.audioFile, 'audio');
    const artworkUrl = getFileUrl(track.artwork, 'image');

    successResponse(
      res,
      {
        ...track.toObject(),
        audioUrl,
        artworkUrl
      },
      'Track retrieved successfully'
    );
  } catch (error) {
    errorResponse(res, 'Failed to retrieve track', error);
  }
};

/**
 * Update track
 * @route PUT /api/tracks/:id
 * @access Private (Artist)
 */
export const updateTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, genre, releaseDate, isrc, stores } = req.body;
    const user = req.user;

    const track = await Track.findById(id);

    if (!track) {
      notFoundResponse(res, 'Track not found');
      return;
    }

    // Check if user is authorized to update this track
    if (track.artistId.toString() !== user._id.toString()) {
      throw new ApiError('Not authorized to update this track', 403);
    }

    // Check if track is already approved
    if (track.status === ReleaseStatus.APPROVED) {
      throw new ApiError('Cannot update an approved track', 400);
    }

    // Update track fields
    if (title) track.title = title;
    if (genre) track.genre = genre;
    if (releaseDate) track.releaseDate = new Date(releaseDate);
    if (isrc) track.isrc = isrc;
    if (stores) track.stores = JSON.parse(stores);

    // If track was rejected, set it back to pending when updated
    if (track.status === ReleaseStatus.REJECTED) {
      track.status = ReleaseStatus.PENDING;
      track.rejectionReason = undefined;
    }

    await track.save();

    // Generate file URLs
    const audioUrl = getFileUrl(track.audioFile, 'audio');
    const artworkUrl = getFileUrl(track.artwork, 'image');

    successResponse(
      res,
      {
        ...track.toObject(),
        audioUrl,
        artworkUrl
      },
      'Track updated successfully'
    );
  } catch (error) {
    errorResponse(res, 'Failed to update track', error);
  }
};

/**
 * Delete track
 * @route DELETE /api/tracks/:id
 * @access Private (Artist)
 */
export const deleteTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    const track = await Track.findById(id);

    if (!track) {
      notFoundResponse(res, 'Track not found');
      return;
    }

    // Check if user is authorized to delete this track
    if (user.role !== UserRole.ADMIN && track.artistId.toString() !== user._id.toString()) {
      throw new ApiError('Not authorized to delete this track', 403);
    }

    // Delete associated files
    const audioPath = path.join(TRACKS_DIR, track.audioFile);
    const artworkPath = path.join(ARTWORK_DIR, track.artwork);
    
    deleteFile(audioPath);
    deleteFile(artworkPath);

    // Delete the track from the database
    await track.deleteOne();

    successResponse(res, null, 'Track deleted successfully');
  } catch (error) {
    errorResponse(res, 'Failed to delete track', error);
  }
};

/**
 * Approve or reject track
 * @route PUT /api/tracks/:id/status
 * @access Private (Admin)
 */
export const updateTrackStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Cast the track to ITrack to ensure type safety
    const track = await Track.findById(id) as ITrack;

    if (!track) {
      notFoundResponse(res, 'Track not found');
      return;
    }

    // Update track status
    track.status = status;

    // If rejecting, set rejection reason
    if (status === ReleaseStatus.REJECTED) {
      track.rejectionReason = rejectionReason;
    } else {
      track.rejectionReason = undefined;
    }

    await track.save();

    // Send notification to artist
    if (status === ReleaseStatus.APPROVED) {
      await notificationService.notifyReleaseApproved(
        track.artistId,
        track._id,
        track.title
      );
    } else if (status === ReleaseStatus.REJECTED) {
      await notificationService.notifyReleaseRejected(
        track.artistId,
        track._id,
        track.title,
        rejectionReason
      );
    }

    successResponse(res, track, `Track ${status} successfully`);
  } catch (error) {
    errorResponse(res, 'Failed to update track status', error);
  }
}; 