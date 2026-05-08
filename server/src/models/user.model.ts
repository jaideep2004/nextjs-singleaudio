import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../config/constants';

export interface IArtistOnboarding {
  legalName: string;
  idType: 'pan' | 'aadhaar';
  idNumber: string;
  legalAddress: string;
  phoneNumber: string;
  numberOfTracks: number;
  numberOfReleases: number;
  governmentIdFile: string; // stored path / URL
}

export interface ILabelOnboarding {
  labelName: string;
  registrationType: 'individual' | 'registered_company';
  // individual
  legalName?: string;
  labelGovIdFile?: string;
  // registered company
  legalEntityName?: string;
  companyType?: 'private' | 'public';
  certificateFile?: string; // incorporation cert or GST cert path
  // shared
  totalArtists: number;
  totalRevenue: number;
  catalogSize: number;
  rightsType: 'exclusive' | 'non_exclusive';
  companyWebsite?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profilePicture?: string;
  artistName?: string;
  bio?: string;
  accountType?: 'artist' | 'label';
  isActive?: boolean;
  onboarding?: IArtistOnboarding | ILabelOnboarding;
  verification?: {
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    mobileProvider?: 'surepass' | 'sandbox' | 'manual';
    kycProvider?: 'surepass' | 'sandbox' | 'manual';
    consent?: boolean;
    phoneNumber?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
    notes?: string;
  };
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.ARTIST,
    },
    profilePicture: {
      type: String,
    },
    artistName: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    accountType: {
      type: String,
      enum: ['artist', 'label'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    onboarding: {
      type: Schema.Types.Mixed,
    },
    verification: {
      status: {
        type: String,
        enum: ['pending', 'submitted', 'approved', 'rejected'],
        default: 'pending',
      },
      mobileProvider: {
        type: String,
        enum: ['surepass', 'sandbox', 'manual'],
      },
      kycProvider: {
        type: String,
        enum: ['surepass', 'sandbox', 'manual'],
      },
      consent: {
        type: Boolean,
        default: false,
      },
      phoneNumber: String,
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      rejectionReason: String,
      notes: String,
    },
    socialLinks: {
      website: String,
      instagram: String,
      twitter: String,
      facebook: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
