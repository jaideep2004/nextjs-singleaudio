import { body } from 'express-validator';
import { UserRole } from '../config/constants';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty() 
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
    
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`),
    
  body('artistName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Artist name must be between 2 and 50 characters'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
    
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
    
  body('socialLinks.website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),
    
  body('socialLinks.instagram')
    .optional()
    .trim()
    .isString()
    .withMessage('Instagram handle must be a string'),
    
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isString()
    .withMessage('Twitter handle must be a string'),
    
  body('socialLinks.facebook')
    .optional()
    .trim()
    .isString()
    .withMessage('Facebook handle must be a string')
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  body('artistName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Artist name must be between 2 and 50 characters'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
    
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
    
  body('socialLinks.website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),
    
  body('socialLinks.instagram')
    .optional()
    .trim()
    .isString()
    .withMessage('Instagram handle must be a string'),
    
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isString()
    .withMessage('Twitter handle must be a string'),
    
  body('socialLinks.facebook')
    .optional()
    .trim()
    .isString()
    .withMessage('Facebook handle must be a string')
];

export const changePasswordValidator = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
]; 