import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import SettingsModel from '../models/settings.model';
import generateToken from '../utils/generateToken';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { ApiError } from '../middleware/errorHandler.middleware';

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
    
    // If signups are disabled and the user is not an admin (admins can always create users)
    if (!signupsEnabled && (!req.body.role || req.body.role !== 'admin')) {
      throw new ApiError('New user registration is currently disabled', 403);
    }

    const { email, password, name, role, artistName, bio, socialLinks } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError('User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      artistName: artistName || name,
      bio,
      socialLinks
    });

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
    }, 'User registered successfully', 201);
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