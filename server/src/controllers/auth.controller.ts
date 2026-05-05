import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import SettingsModel from '../models/settings.model';
import generateToken from '../utils/generateToken';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { ApiError } from '../middleware/errorHandler.middleware';

// Escape special regex characters in a string
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Check artist name availability
 * @route GET /api/auth/check-artist-name
 * @access Public
 */
export const checkArtistName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new ApiError('Name query parameter is required', 400);
    }

    const exists = await User.findOne({
      artistName: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') },
    });

    successResponse(res, { available: !exists }, 'Artist name availability checked');
  } catch (error) {
    errorResponse(res, 'Failed to check artist name', error);
  }
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if signups are enabled
    const signupSetting = await SettingsModel.findOne({ key: 'signupEnabled' });
    const signupsEnabled = signupSetting ? signupSetting.value === true : true;

    if (!signupsEnabled && (!req.body.role || req.body.role !== 'admin')) {
      throw new ApiError('New user registration is currently disabled', 403);
    }

    const {
      email,
      password,
      name,
      role,
      accountType,
      // artist fields
      artistName,
      legalName,
      idType,
      idNumber,
      legalAddress,
      phoneNumber,
      numberOfTracks,
      numberOfReleases,
      // label fields
      labelName,
      registrationType,
      legalEntityName,
      companyType,
      totalArtists,
      totalRevenue,
      catalogSize,
      rightsType,
      companyWebsite,
      socialLinks,
      bio,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError('User already exists with this email', 400);
    }

    // Check artist name uniqueness
    if (artistName) {
      const artistNameExists = await User.findOne({
        artistName: { $regex: new RegExp(`^${escapeRegex(artistName)}$`, 'i') },
      });
      if (artistNameExists) {
        throw new ApiError('Artist name is already taken', 400);
      }
    }

    // Build onboarding sub-document
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    let onboarding: Record<string, unknown> | undefined;

    if (accountType === 'artist') {
      onboarding = {
        legalName,
        idType,
        idNumber,
        legalAddress,
        phoneNumber,
        numberOfTracks: Number(numberOfTracks) || 0,
        numberOfReleases: Number(numberOfReleases) || 0,
        governmentIdFile: files?.governmentIdFile?.[0]?.path || '',
      };
    } else if (accountType === 'label') {
      const parsedSocialLinks =
        typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;

      onboarding = {
        labelName,
        registrationType,
        legalName: registrationType === 'individual' ? legalName : undefined,
        labelGovIdFile:
          registrationType === 'individual'
            ? files?.labelGovIdFile?.[0]?.path || ''
            : undefined,
        legalEntityName:
          registrationType === 'registered_company' ? legalEntityName : undefined,
        companyType: registrationType === 'registered_company' ? companyType : undefined,
        certificateFile:
          registrationType === 'registered_company'
            ? companyType === 'private'
              ? files?.incorporationCertFile?.[0]?.path || ''
              : files?.gstCertFile?.[0]?.path || ''
            : undefined,
        totalArtists: Number(totalArtists) || 0,
        totalRevenue: Number(totalRevenue) || 0,
        catalogSize: Number(catalogSize) || 0,
        rightsType,
        companyWebsite: companyWebsite || undefined,
        socialLinks: parsedSocialLinks || undefined,
      };
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || (accountType === 'label' ? 'label' : 'artist'),
      accountType,
      artistName: artistName || undefined,
      bio,
      onboarding,
    });

    // Generate token
    const token = generateToken(user);

    successResponse(
      res,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        artistName: user.artistName,
        accountType: user.accountType,
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    errorResponse(res, 'Registration failed', error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    successResponse(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      artistName: user.artistName,
      token
    }, 'Login successful');
  } catch (error) {
    errorResponse(res, 'Login failed', error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    successResponse(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      artistName: user.artistName,
      bio: user.bio,
      socialLinks: user.socialLinks,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt 
    }, 'User profile retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Failed to get user profile', error);
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/me
 * @access Private
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, artistName, bio, socialLinks } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Update fields
    if (name) user.name = name;
    if (artistName) user.artistName = artistName;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...socialLinks
      };
    }

    await user.save();

    successResponse(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      artistName: user.artistName,
      bio: user.bio,
      socialLinks: user.socialLinks,
      profilePicture: user.profilePicture
    }, 'Profile updated successfully');
  } catch (error) {
    errorResponse(res, 'Failed to update profile', error);
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    errorResponse(res, 'Failed to change password', error);
  }
}; 