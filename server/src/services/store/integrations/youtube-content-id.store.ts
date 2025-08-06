import { IStore, IStoreDelivery, IStoreDeliveryReport } from '../../../types/store';
import { ITrack } from '../../../types/track';
import { BaseStoreIntegration } from '../base.store';
import { google } from 'googleapis';
import { logger } from '../../../utils/logger';

export class YoutubeContentIdStoreIntegration extends BaseStoreIntegration {
  private youtube: any;
  private contentIdApi: any;
  
  protected initializeApiClient(): void {
    const auth = new google.auth.OAuth2(
      this.credentials.clientId,
      this.credentials.clientSecret,
      this.credentials.redirectUri
    );
    
    auth.setCredentials({
      access_token: this.credentials.accessToken,
      refresh_token: this.credentials.refreshToken,
      expiry_date: this.credentials.expiryDate,
    });
    
    this.youtube = google.youtube('v3');
    this.contentIdApi = google.youtubePartner({
      version: 'v1',
      auth,
    });
  }

  async getStoreInfo() {
    return {
      id: 'youtube-content-id',
      name: 'YouTube Content ID',
      logo: 'https://www.gstatic.com/youtube/ytm/settings/ytm_logo_144.png',
      supportedFormats: ['mp3', 'wav', 'aac', 'flac'],
      supportedCodecs: ['mp3', 'aac', 'vorbis', 'opus'],
      maxFileSize: 256 * 1024 * 1024, // 256MB
      requiresArtwork: true,
      requiresIsrc: true,
      requiresUpc: false,
      requiresLyrics: false,
      requiresExplicitLyrics: false,
      requiresCopyright: true,
      requiresLabel: true,
      allowsPreRelease: true,
      allowsTerritorySelection: true,
      allowsStoreSelection: false,
      deliveryLeadTime: 48, // hours
      deliveryMethod: 'api',
      reportingFrequency: 'daily',
      reportingDelay: 1, // days
    };
  }

  async authenticate(credentials: any): Promise<{ authenticated: boolean; error?: string }> {
    try {
      // Test the credentials by making a simple API call
      const response = await this.contentIdApi.ownership.list({});
      return { authenticated: true };
    } catch (error) {
      logger.error('YouTube Content ID authentication failed', { error });
      return { 
        authenticated: false, 
        error: 'Failed to authenticate with YouTube Content ID API' 
      };
    }
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const auth = new google.auth.OAuth2(
        this.credentials.clientId,
        this.credentials.clientSecret,
        this.credentials.redirectUri
      );
      
      auth.setCredentials({
        refresh_token: this.credentials.refreshToken,
      });
      
      const { credentials } = await auth.refreshAccessToken();
      
      // Update stored credentials
      this.credentials.accessToken = credentials.access_token;
      this.credentials.expiryDate = credentials.expiry_date;
      
      // Reinitialize the API client with the new token
      this.initializeApiClient();
      
      return {
        accessToken: credentials.access_token!,
        expiresIn: credentials.expires_in!,
      };
    } catch (error) {
      logger.error('Failed to refresh YouTube Content ID token', { error });
      throw new Error('Failed to refresh access token: ' + error.message);
    }
  }

  async validateCredentials(credentials: any): Promise<{ valid: boolean; error?: string }> {
    return this.authenticate(credentials);
  }

  async validateTrack(track: ITrack): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Base validation
    const baseValidation = await super.validateTrack(track);
    if (!baseValidation.valid) {
      errors.push(...baseValidation.errors);
    }

    // YouTube Content ID specific validation
    if (!track.metadata.isrc) {
      errors.push('ISRC is required for YouTube Content ID');
    }

    if (!track.artwork) {
      errors.push('Artwork is required for YouTube Content ID');
    }

    if (!track.metadata.copyright) {
      errors.push('Copyright information is required for YouTube Content ID');
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

      // Register the asset with YouTube Content ID
      const assetResponse = await this.contentIdApi.assets.insert({
        requestBody: this.formatTrackForDelivery(track),
      });
      
      const assetId = assetResponse.data.id;
      
      // Create a reference for the asset
      const referenceResponse = await this.contentIdApi.assetReferences.insert({
        assetId,
        requestBody: {
          // Add reference details like ISRC, etc.
        },
      });
      
      // Create delivery record
      const delivery: IStoreDelivery = {
        storeId: store._id.toString(),
        trackId: track._id.toString(),
        status: 'delivered',
        externalId: assetId,
        deliveryDate: new Date(),
        lastChecked: new Date(),
        metadata: {
          referenceId: referenceResponse.data.id,
          assetStatus: assetResponse.data.status,
        }
      };

      return delivery;
    } catch (error) {
      logger.error('Failed to deliver track to YouTube Content ID', { 
        trackId: track._id, 
        error: error.response?.data || error.message 
      });
      
      throw this.handleError(error);
    }
  }

  // Other required methods with placeholder implementations
  async updateTrack(track: ITrack, store: IStore): Promise<IStoreDelivery> {
    throw new Error('Update track not implemented for YouTube Content ID');
  }

  async removeTrack(trackId: string, store: IStore): Promise<{ success: boolean; message?: string }> {
    throw new Error('Remove track not implemented for YouTube Content ID');
  }

  async getDeliveryStatus(deliveryId: string): Promise<{
    status: 'pending' | 'processing' | 'delivered' | 'failed';
    message?: string;
    externalId?: string;
    deliveredAt?: Date;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await this.contentIdApi.assets.get({
        assetId: deliveryId,
      });
      
      return {
        status: this.mapStatus(response.data.status),
        externalId: deliveryId,
        metadata: {
          status: response.data.status,
          type: response.data.type,
          timeCreated: response.data.timeCreated,
        },
      };
    } catch (error) {
      return {
        status: 'failed',
        message: error.response?.data?.error?.message || 'Failed to get delivery status',
      };
    }
  }

  async fetchReports(startDate: Date, endDate: Date): Promise<IStoreDeliveryReport[]> {
    try {
      const response = await this.contentIdApi.reports.query({
        onBehalfOfContentOwner: this.credentials.contentOwnerId,
        fromDate: this.formatDate(startDate),
        toDate: this.formatDate(endDate),
        reportType: 'owner',
      });
      
      // Process and map the report data
      return response.data.rows.map((row: any) => ({
        deliveryId: row.assetId,
        storeId: this.store._id.toString(),
        trackId: row.assetId, // This should be mapped to your internal track ID
        reportDate: new Date(),
        streams: parseInt(row.views) || 0,
        downloads: 0, // YouTube doesn't have downloads
        revenue: parseFloat(row.revenue) || 0,
        currency: row.currency || 'USD',
        periodStart: startDate,
        periodEnd: endDate,
      }));
    } catch (error) {
      logger.error('Failed to fetch reports from YouTube Content ID', { error });
      throw this.handleError(error);
    }
  }

  async fetchDetailedReport(reportId: string): Promise<any> {
    throw new Error('Detailed report not implemented for YouTube Content ID');
  }

  // Helper methods
  private formatTrackForDelivery(track: ITrack): any {
    return {
      type: 'sound_recording',
      title: track.metadata.title,
      isrc: track.metadata.isrc,
      label: track.metadata.recordLabel,
      artist: track.metadata.primaryArtist,
      album: track.metadata.albumName,
      releaseDate: track.releaseDate.toISOString().split('T')[0],
      // Add more fields as needed for YouTube Content ID
    };
  }

  private mapStatus(youtubeStatus: string): 'pending' | 'processing' | 'delivered' | 'failed' {
    const statusMap: Record<string, any> = {
      'active': 'delivered',
      'inactive': 'failed',
      'pending': 'processing',
      'processing': 'processing',
      'rejected': 'failed',
      'deleted': 'failed',
    };
    
    return statusMap[youtubeStatus.toLowerCase()] || 'pending';
  }

  protected handleError(error: any): { code: string; message: string; retryable: boolean } {
    // Handle YouTube Content ID specific errors
    if (error.response?.data?.error) {
      const youtubeError = error.response.data.error;
      return {
        code: youtubeError.code || 'YOUTUBE_CONTENT_ID_ERROR',
        message: youtubeError.message || 'YouTube Content ID API error',
        retryable: this.isRetryableError(error)
      };
    }
    
    return super.handleError(error);
  }

  protected isRetryableError(error: any): boolean {
    // YouTube Content ID specific retry logic
    if (error.response?.status === 403) {
      // Rate limiting or quota exceeded
      return true;
    }
    
    if (error.response?.status >= 500) {
      return true; // Server errors
    }
    
    return super.isRetryableError(error);
  }
}
