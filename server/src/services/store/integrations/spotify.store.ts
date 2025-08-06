import { IStore, IStoreDelivery, IStoreDeliveryReport } from '../../../types/store';
import { ITrack } from '../../../types/track';
import { BaseStoreIntegration } from '../base.store';
import axios, { AxiosInstance } from 'axios';
import { logger } from '../../../utils/logger';

export class SpotifyStoreIntegration extends BaseStoreIntegration {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  protected initializeApiClient(): void {
    this.api = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(async (config) => {
      await this.ensureAuthenticated();
      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If unauthorized, refresh token and retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
          return this.api(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt - 30000) {
      await this.authenticate(this.credentials);
    }
  }

  async getStoreInfo() {
    return {
      id: 'spotify',
      name: 'Spotify',
      logo: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png',
      supportedFormats: ['mp3', 'wav', 'flac'],
      supportedCodecs: ['mp3', 'aac', 'vorbis'],
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      requiresArtwork: true,
      requiresIsrc: true,
      requiresUpc: true,
      requiresLyrics: false,
      requiresExplicitLyrics: true,
      requiresCopyright: true,
      requiresLabel: true,
      allowsPreRelease: true,
      allowsTerritorySelection: true,
      allowsStoreSelection: false,
      deliveryLeadTime: 72, // hours
      deliveryMethod: 'api',
      reportingFrequency: 'daily',
      reportingDelay: 2, // days
    };
  }

  async authenticate(credentials: any): Promise<{ authenticated: boolean; error?: string }> {
    try {
      const { clientId, clientSecret } = credentials;
      
      if (!clientId || !clientSecret) {
        throw new Error('Missing Spotify API credentials');
      }

      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
      
      return { authenticated: true };
    } catch (error) {
      logger.error('Spotify authentication failed', { error });
      return { 
        authenticated: false, 
        error: error.response?.data?.error_description || 'Authentication failed' 
      };
    }
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    // For client credentials flow, we just re-authenticate
    const result = await this.authenticate(this.credentials);
    if (!result.authenticated) {
      throw new Error('Failed to refresh Spotify token: ' + (result.error || 'Unknown error'));
    }
    return {
      accessToken: this.accessToken!,
      expiresIn: Math.floor((this.tokenExpiresAt - Date.now()) / 1000)
    };
  }

  async validateCredentials(credentials: any): Promise<{ valid: boolean; error?: string }> {
    try {
      const result = await this.authenticate(credentials);
      return { 
        valid: result.authenticated, 
        error: result.error 
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message || 'Invalid credentials' 
      };
    }
  }

  async validateTrack(track: ITrack): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Run base validation first
    const baseValidation = await super.validateTrack(track);
    if (!baseValidation.valid) {
      errors.push(...baseValidation.errors);
    }

    // Spotify-specific validation
    if (!track.metadata.isrc) {
      errors.push('ISRC is required for Spotify');
    }

    if (!track.artwork) {
      errors.push('Artwork is required for Spotify');
    }

    if (track.metadata.explicit === undefined) {
      errors.push('Explicit content flag is required for Spotify');
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

      // Prepare track data for Spotify
      const trackData = this.formatTrackForDelivery(track);
      
      // Make API call to deliver track to Spotify
      const response = await this.api.post('/tracks', trackData);
      
      // Create delivery record
      const delivery: IStoreDelivery = {
        storeId: store._id.toString(),
        trackId: track._id.toString(),
        status: 'delivered',
        externalId: response.data.id,
        deliveryDate: new Date(),
        lastChecked: new Date(),
        metadata: {
          spotifyUri: response.data.uri,
          spotifyUrl: response.data.external_urls?.spotify,
        }
      };

      return delivery;
    } catch (error) {
      logger.error('Failed to deliver track to Spotify', { 
        trackId: track._id, 
        error: error.response?.data || error.message 
      });
      
      throw this.handleError(error);
    }
  }

  async updateTrack(track: ITrack, store: IStore): Promise<IStoreDelivery> {
    // Similar to deliverTrack but for updates
    // Implementation omitted for brevity
    throw new Error('Update track not implemented for Spotify');
  }

  async removeTrack(trackId: string, store: IStore): Promise<{ success: boolean; message?: string }> {
    try {
      await this.api.delete(`/tracks/${trackId}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to remove track from Spotify', { trackId, error });
      return { 
        success: false, 
        message: error.response?.data?.error?.message || 'Failed to remove track' 
      };
    }
  }

  async getDeliveryStatus(deliveryId: string): Promise<{
    status: 'pending' | 'processing' | 'delivered' | 'failed';
    message?: string;
    externalId?: string;
    deliveredAt?: Date;
    metadata?: Record<string, any>;
  }> {
    // Implementation depends on how Spotify provides delivery status
    // This is a simplified example
    try {
      const response = await this.api.get(`/tracks/${deliveryId}`);
      return {
        status: 'delivered',
        externalId: response.data.id,
        deliveredAt: new Date(),
        metadata: {
          spotifyUri: response.data.uri,
          spotifyUrl: response.data.external_urls?.spotify,
        }
      };
    } catch (error) {
      return {
        status: 'failed',
        message: error.response?.data?.error?.message || 'Failed to get delivery status'
      };
    }
  }

  async fetchReports(startDate: Date, endDate: Date): Promise<IStoreDeliveryReport[]> {
    // Implementation for fetching reports from Spotify API
    // This is a simplified example
    try {
      const response = await this.api.get('/reports/delivery', {
        params: {
          start_date: this.formatDate(startDate),
          end_date: this.formatDate(endDate),
        },
      });

      return response.data.items.map((item: any) => ({
        deliveryId: item.id,
        storeId: this.store._id.toString(),
        trackId: item.track_id,
        reportDate: new Date(item.report_date),
        streams: item.streams || 0,
        downloads: item.downloads || 0,
        revenue: item.revenue || 0,
        currency: item.currency || 'USD',
        periodStart: new Date(item.period_start),
        periodEnd: new Date(item.period_end),
      }));
    } catch (error) {
      logger.error('Failed to fetch reports from Spotify', { error });
      throw this.handleError(error);
    }
  }

  async fetchDetailedReport(reportId: string): Promise<any> {
    // Implementation for fetching detailed report
    // This would include more granular data
    throw new Error('Detailed report not implemented for Spotify');
  }

  // Helper methods
  protected formatTrackForDelivery(track: ITrack): any {
    return {
      name: track.metadata.title,
      isrc: track.metadata.isrc,
      artists: [
        {
          name: track.metadata.primaryArtist,
          // Add more artist details as needed
        },
        // Add featuring artists if any
        ...(track.metadata.featuringArtists?.map(artist => ({
          name: artist,
          // Add more artist details as needed
        })) || [])
      ],
      album: {
        name: track.metadata.albumName || `${track.metadata.title} - Single`,
        release_date: track.releaseDate.toISOString().split('T')[0],
        // Add more album details as needed
      },
      // Add more track metadata as needed
    };
  }

  protected handleError(error: any): { code: string; message: string; retryable: boolean } {
    if (error.response) {
      const { status, data } = error.response;
      
      // Rate limiting
      if (status === 429) {
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please try again later.',
          retryable: true,
        };
      }
      
      // Authentication errors
      if (status === 401) {
        return {
          code: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed. Please check your credentials.',
          retryable: false,
        };
      }
      
      // Validation errors
      if (status === 400) {
        return {
          code: 'VALIDATION_ERROR',
          message: data.error?.message || 'Validation failed',
          retryable: false,
        };
      }
      
      // Server errors
      if (status >= 500) {
        return {
          code: 'SERVER_ERROR',
          message: 'Spotify API is currently unavailable. Please try again later.',
          retryable: true,
        };
      }
    }
    
    // Network errors or other issues
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      retryable: this.isRetryableError(error),
    };
  }

  protected isRetryableError(error: any): boolean {
    // Network errors are usually retryable
    if (!error.response) return true;
    
    // 5xx errors are retryable
    if (error.response.status >= 500) return true;
    
    // Rate limiting is retryable after delay
    if (error.response.status === 429) return true;
    
    // Other errors are not retryable by default
    return false;
  }

  protected getErrorResolution(error: any): string {
    if (error.response?.status === 429) {
      return 'You have exceeded the rate limit. Please wait a few minutes and try again.';
    }
    
    if (error.response?.status === 401) {
      return 'Please check your Spotify API credentials and ensure they are valid.';
    }
    
    if (error.response?.status === 400) {
      return 'Please check the track data and ensure all required fields are provided.';
    }
    
    return 'Please try again later or contact support if the problem persists.';
  }
}
