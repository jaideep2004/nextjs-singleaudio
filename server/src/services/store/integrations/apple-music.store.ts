import { IStore, IStoreDelivery, IStoreDeliveryReport } from '../../../types/store';
import { ITrack } from '../../../types/track';
import { BaseStoreIntegration } from '../base.store';
import axios, { AxiosInstance } from 'axios';
import { logger } from '../../../utils/logger';

export class AppleMusicStoreIntegration extends BaseStoreIntegration {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private developerToken: string;
  private musicUserToken: string | null = null;

  constructor(store: IStore) {
    super(store);
    this.developerToken = this.credentials.developerToken;
  }

  protected initializeApiClient(): void {
    this.api = axios.create({
      baseURL: 'https://api.music.apple.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.developerToken}`,
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(async (config) => {
      if (this.musicUserToken) {
        config.headers['Music-User-Token'] = this.musicUserToken;
      }
      return config;
    });
  }

  async getStoreInfo() {
    return {
      id: 'apple-music',
      name: 'Apple Music',
      logo: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
      supportedFormats: ['aac', 'alac', 'wav', 'aiff'],
      supportedCodecs: ['aac', 'alac'],
      maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
      requiresArtwork: true,
      requiresIsrc: true,
      requiresUpc: true,
      requiresLyrics: true,
      requiresExplicitLyrics: true,
      requiresCopyright: true,
      requiresLabel: true,
      allowsPreRelease: true,
      allowsTerritorySelection: true,
      allowsStoreSelection: true,
      deliveryLeadTime: 96, // hours
      deliveryMethod: 'api',
      reportingFrequency: 'weekly',
      reportingDelay: 7, // days
    };
  }

  async authenticate(credentials: any): Promise<{ authenticated: boolean; error?: string }> {
    // Apple Music uses a developer token for authentication
    // User token is obtained client-side and passed in for certain operations
    return { authenticated: true };
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    // For Apple Music, we just return the current tokens
    // The developer token is long-lived and should be refreshed by the client
    return {
      accessToken: this.developerToken,
      expiresIn: 3600 // Default expiration
    };
  }

  async validateCredentials(credentials: any): Promise<{ valid: boolean; error?: string }> {
    try {
      // Test the developer token by making a simple API call
      await this.api.get('/me');
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.response?.data?.errors?.[0]?.detail || 'Invalid Apple Music credentials' 
      };
    }
  }

  async validateTrack(track: ITrack): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Base validation
    const baseValidation = await super.validateTrack(track);
    if (!baseValidation.valid) {
      errors.push(...baseValidation.errors);
    }

    // Apple Music specific validation
    if (!track.metadata.isrc) {
      errors.push('ISRC is required for Apple Music');
    }

    if (!track.artwork) {
      errors.push('Artwork is required for Apple Music');
    }

    if (!track.metadata.language) {
      errors.push('Language is required for Apple Music');
    }

    if (track.metadata.explicit === undefined) {
      errors.push('Explicit content flag is required for Apple Music');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async deliverTrack(track: ITrack, store: IStore): Promise<IStoreDelivery> {
    try {
      // Validate track first
      const validation = await this.validateTrack(track);
      if (!validation.valid) {
        throw new Error(`Track validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare track data for Apple Music
      const trackData = this.formatTrackForDelivery(track);
      
      // Make API call to deliver track to Apple Music
      const response = await this.api.post('/catalog/us/songs', trackData);
      
      // Create delivery record
      const delivery: IStoreDelivery = {
        storeId: store._id.toString(),
        trackId: track._id.toString(),
        status: 'delivered',
        externalId: response.data.data[0]?.id,
        deliveryDate: new Date(),
        lastChecked: new Date(),
        metadata: {
          appleMusicUrl: response.data.data[0]?.attributes?.url,
          previewUrl: response.data.data[0]?.attributes?.previews?.[0]?.url,
        }
      };

      return delivery;
    } catch (error) {
      logger.error('Failed to deliver track to Apple Music', { 
        trackId: track._id, 
        error: error.response?.data || error.message 
      });
      
      throw this.handleError(error);
    }
  }

  // Other required methods with placeholder implementations
  async updateTrack(track: ITrack, store: IStore): Promise<IStoreDelivery> {
    throw new Error('Update track not implemented for Apple Music');
  }

  async removeTrack(trackId: string, store: IStore): Promise<{ success: boolean; message?: string }> {
    throw new Error('Remove track not implemented for Apple Music');
  }

  async getDeliveryStatus(deliveryId: string): Promise<{
    status: 'pending' | 'processing' | 'delivered' | 'failed';
    message?: string;
    externalId?: string;
    deliveredAt?: Date;
    metadata?: Record<string, any>;
  }> {
    throw new Error('Get delivery status not implemented for Apple Music');
  }

  async fetchReports(startDate: Date, endDate: Date): Promise<IStoreDeliveryReport[]> {
    throw new Error('Fetch reports not implemented for Apple Music');
  }

  async fetchDetailedReport(reportId: string): Promise<any> {
    throw new Error('Detailed report not implemented for Apple Music');
  }

  // Helper methods
  protected formatTrackForDelivery(track: ITrack): any {
    // Format track data according to Apple Music API requirements
    return {
      data: [{
        type: 'songs',
        attributes: {
          artistName: track.metadata.primaryArtist,
          composerName: track.metadata.composers?.map(c => c.name).join(', '),
          durationInMillis: track.primaryVersion?.audioFile?.duration ? 
            Math.round(track.primaryVersion.audioFile.duration * 1000) : undefined,
          genreNames: track.genres,
          name: track.metadata.title,
          releaseDate: track.releaseDate.toISOString().split('T')[0],
          isrc: track.metadata.isrc,
          url: track.metadata.externalUrls?.appleMusic,
          artwork: track.artwork ? {
            width: track.artwork.width,
            height: track.artwork.height,
            url: track.artwork.url
          } : undefined,
          playParams: {
            id: track._id.toString(),
            kind: 'song'
          },
          trackNumber: track.metadata.trackNumber,
          discNumber: track.metadata.discNumber,
          isAppleDigitalMaster: track.metadata.isAppleDigitalMaster,
          audioTraits: ['lossless', 'lossy'],
          hasLyrics: !!track.metadata.lyrics,
          hasCredits: true,
          isMasteredForItunes: track.metadata.isMasteredForItunes,
          contentRating: track.metadata.explicit ? 'explicit' : 'clean',
          // Add more fields as needed
        }
      }]
    };
  }

  protected handleError(error: any): { code: string; message: string; retryable: boolean } {
    // Handle Apple Music specific errors
    if (error.response?.data?.errors?.[0]) {
      const appleError = error.response.data.errors[0];
      return {
        code: appleError.code || 'APPLE_MUSIC_ERROR',
        message: appleError.detail || 'Apple Music API error',
        retryable: this.isRetryableError(error)
      };
    }
    
    return super.handleError(error);
  }

  protected isRetryableError(error: any): boolean {
    // Apple Music specific retry logic
    if (error.response?.status === 429) {
      return true; // Rate limiting
    }
    
    if (error.response?.status >= 500) {
      return true; // Server errors
    }
    
    return super.isRetryableError(error);
  }
}
