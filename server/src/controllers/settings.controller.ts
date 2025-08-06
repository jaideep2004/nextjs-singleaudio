import { Request, Response } from 'express';
import httpStatus from 'http-status';
import SettingsModel from '../models/settings.model';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';

const getSettings = catchAsync(async (req: Request, res: Response) => {
  const settings = await SettingsModel.find({});
  res.status(httpStatus.OK).json({
    success: true,
    data: settings,
  });
});

const getSetting = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;
  const setting = await SettingsModel.findOne({ key });
  
  if (!setting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
  }
  
  res.status(httpStatus.OK).json({
    success: true,
    data: setting,
  });
});

// Public method to get signup enabled status - no auth required
const getSignupEnabled = catchAsync(async (req: Request, res: Response) => {
  const setting = await SettingsModel.findOne({ key: 'signupEnabled' });
  
  // Default to enabled if setting doesn't exist
  const enabled = setting ? setting.value : true;
  
  res.status(httpStatus.OK).json({
    success: true,
    data: {
      key: 'signupEnabled',
      value: enabled,
      description: 'Whether new user signups are enabled'
    },
  });
});

const updateSetting = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value, description } = req.body;
  
  if (value === undefined) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Value is required');
  }
  
  const setting = await SettingsModel.findOneAndUpdate(
    { key },
    { value, description },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  res.status(httpStatus.OK).json({
    success: true,
    data: setting,
  });
});

// Initialize default settings if they don't exist
const initializeDefaultSettings = async () => {
  const defaultSettings = [
    { 
      key: 'signupEnabled', 
      value: true, 
      description: 'Whether new user signups are enabled' 
    },
    // Add more default settings here as needed
  ];

  for (const setting of defaultSettings) {
    await SettingsModel.findOneAndUpdate(
      { key: setting.key },
      { $setOnInsert: setting },
      { upsert: true, new: true }
    );
  }
};

export default {
  getSettings,
  getSetting,
  getSignupEnabled,
  updateSetting,
  initializeDefaultSettings,
};
