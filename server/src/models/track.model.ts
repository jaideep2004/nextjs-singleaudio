import mongoose, { Document, Schema } from 'mongoose';
import { ReleaseStatus, STORES } from '../config/constants';

export interface ITrack extends Document {
  title: string;
  artistId: mongoose.Types.ObjectId;
  artistName: string;
  genre: string;
  releaseDate: Date;
  isrc?: string;
  upc?: string;
  pline?: string;
  cline?: string;
  label?: string; 
  publisher?: string;
  explicit?: boolean;
  iswc?: string;
  isni?: string;
  language?: string;
  audioFile: string;
  artwork: string;
  duration?: number;
  stores: string[];
  status: ReleaseStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Track title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    artistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artist ID is required']
    },
    artistName: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    isrc: {
      type: String,
      trim: true,
      maxlength: [15, 'ISRC cannot be more than 15 characters']
    },
    upc: {
      type: String,
      trim: true,
      maxlength: [15, 'UPC cannot be more than 15 characters']
    },
    pline: {
      type: String,
      trim: true,
      maxlength: [255, 'PLine cannot be more than 255 characters']
    },
    cline: {
      type: String,
      trim: true,
      maxlength: [255, 'CLine cannot be more than 255 characters']
    },
    label: {
      type: String,
      trim: true,
      maxlength: [100, 'Label cannot be more than 100 characters']
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, 'Publisher cannot be more than 100 characters']
    },
    explicit: {
      type: Boolean,
      default: false
    },
    iswc: {
      type: String,
      trim: true,
      maxlength: [15, 'ISWC cannot be more than 15 characters']
    },
    isni: {
      type: String,
      trim: true,
      maxlength: [16, 'ISNI cannot be more than 16 characters']
    },
    language: {
      type: String,
      trim: true,
      maxlength: [10, 'Language code cannot be more than 10 characters']
    },
    audioFile: {
      type: String,
      required: [true, 'Audio file is required']
    },
    artwork: {
      type: String,
      required: [true, 'Artwork is required']
    },
    duration: {
      type: Number
    },
    format: {
      type: String
    },
    bitrate: {
      type: Number
    },
    loudness: {
      type: Number
    },
    stores: {
      type: [String],
      enum: STORES,
      validate: {
        validator: function(stores: string[]) {
          return stores && stores.length > 0;
        },
        message: 'At least one store must be selected'
      }
    },
    status: {
      type: String,
      enum: Object.values(ReleaseStatus),
      default: ReleaseStatus.PENDING
    },
    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for faster queries
TrackSchema.index({ artistId: 1 });
TrackSchema.index({ status: 1 });
TrackSchema.index({ releaseDate: -1 });

export default mongoose.model<ITrack>('Track', TrackSchema); 