import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import { successResponse, errorResponse, notFoundResponse } from '../utils/apiResponse';
import { ApiError } from '../middleware/errorHandler.middleware';
import { UserRole } from '../config/constants';

/**
 * Create a new user (admin only)
 * @route POST /api/users
 * @access Private (Admin)
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, artistName, bio, socialLinks } = req.body;

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
      socialLinks,
      createdBy: req.user._id // Track who created this user
    });

    successResponse(
      res,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        artistName: user.artistName
      },
      'User created successfully',
      201
    );
  } catch (error) {
    errorResponse(res, 'Failed to create user', error);
  }
};

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Private (Admin)
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get users with pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Apply filters
    let query: any = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { artistName: searchRegex }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    successResponse(
      res,
      {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    errorResponse(res, 'Failed to retrieve users', error);
  }
};

/**
 * Get user by ID (admin only)
 * @route GET /api/users/:id
 * @access Private (Admin)
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Failed to retrieve user', error);
  }
};

/**
 * Update user (admin only)
 * @route PUT /api/users/:id
 * @access Private (Admin)
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, artistName, bio, socialLinks } = req.body;

    const user = await User.findById(id);

    if (!user) {
      notFoundResponse(res, 'User not found');
      return;
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      user.role = role as UserRole;
    }
    if (artistName) user.artistName = artistName;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...socialLinks
      };
    }

    await user.save();

    successResponse(res, user, 'User updated successfully');
  } catch (error) {
    errorResponse(res, 'Failed to update user', error);
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      notFoundResponse(res, 'User not found');
      return;
    }

    // Don't allow deletion of the last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await User.countDocuments({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        throw new ApiError('Cannot delete the last admin user', 400);
      }
    }

    await user.deleteOne();

    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    errorResponse(res, 'Failed to delete user', error);
  }
};

/**
 * Get user statistics (admin only)
 * @route GET /api/users/stats
 * @access Private (Admin)
 */
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const artistCount = await User.countDocuments({ role: UserRole.ARTIST });
    const adminCount = await User.countDocuments({ role: UserRole.ADMIN });

    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly registration data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Format the monthly stats for easier consumption
    const formattedMonthlyStats = monthlyStats.map(stat => ({
      year: stat._id.year,
      month: stat._id.month,
      count: stat.count
    }));

    // Return all stats
    successResponse(
      res,
      {
        totalUsers,
        artistCount,
        adminCount,
        recentUsers,
        monthlyStats: formattedMonthlyStats,
        // Include additional stats for the dashboard
        totalTracks: 0, // These would come from Track model
        pendingTracks: 0,
        totalReleases: 0,
        pendingReleases: 0,
        pendingPayouts: 0,
        totalRevenue: 0
      },
      'User statistics retrieved successfully'
    );
  } catch (error) {
    errorResponse(res, 'Failed to retrieve user statistics', error);
  }
}; 