import { ITrack } from '../../types/track';
import { IStore, IStoreDelivery, IStoreDeliveryReport } from '../../types/store';

export interface IStoreIntegration {
  // Store information
  getStoreInfo(): Promise<{
    id: string;
    name: string;
    logo?: string;
    supportedFormats: string[];
    supportedCodecs: string[];
    maxFileSize: number; // in bytes
    maxDuration?: number; // in seconds
    requiresArtwork: boolean;
    requiresIsrc: boolean;
    requiresUpc: boolean;
    requiresLyrics: boolean;
    requiresExplicitLyrics: boolean;
    requiresCopyright: boolean;
    requiresLabel: boolean;
    requiresPLine: boolean;
    requiresCLine: boolean;
    allowsPreRelease: boolean;
    allowsTerritorySelection: boolean;
    allowsStoreSelection: boolean;
    deliveryLeadTime: number; // in hours
    deliveryMethod: 'api' | 'sftp' | 'email' | 'manual';
    deliveryInstructions?: string;
    reportingFrequency: 'daily' | 'weekly' | 'monthly';
    reportingDelay: number; // in days
  }>;

  // Authentication
  authenticate(credentials: any): Promise<{ authenticated: boolean; error?: string }>;
  refreshToken(): Promise<{ accessToken: string; expiresIn: number }>;
  validateCredentials(credentials: any): Promise<{ valid: boolean; error?: string }>;

  // Content delivery
  validateTrack(track: ITrack): Promise<{ valid: boolean; errors: string[] }>;
  deliverTrack(track: ITrack, store: IStore): Promise<IStoreDelivery>;
  updateTrack(track: ITrack, store: IStore): Promise<IStoreDelivery>;
  removeTrack(trackId: string, store: IStore): Promise<{ success: boolean; message?: string }>;
  getDeliveryStatus(deliveryId: string): Promise<{
    status: 'pending' | 'processing' | 'delivered' | 'failed';
    message?: string;
    externalId?: string;
    deliveredAt?: Date;
    metadata?: Record<string, any>;
  }>;

  // Reporting
  fetchReports(startDate: Date, endDate: Date): Promise<IStoreDeliveryReport[]>;
  fetchDetailedReport(reportId: string): Promise<any>;
  fetchEarnings(startDate: Date, endDate: Date): Promise<{
    totalEarnings: number;
    currency: string;
    byTrack: Array<{
      trackId: string;
      trackTitle: string;
      earnings: number;
      streams: number;
      downloads: number;
    }>;
    byTerritory: Record<string, { earnings: number; currency: string }>;
    byDate: Array<{ date: Date; earnings: number }>;
  }>;

  // Store-specific metadata
  getGenres(): Promise<Array<{ id: string; name: string; parentId?: string }>>;
  getSubgenres(genreId: string): Promise<Array<{ id: string; name: string }>>;
  getMoods(): Promise<Array<{ id: string; name: string }>>;
  getLanguages(): Promise<Array<{ code: string; name: string }>>;
  getTerritories(): Promise<Array<{ code: string; name: string }>>;
  getAudioQualities(): Promise<Array<{ id: string; name: string; bitrate?: number }>>;
  getArtworkSpecs(): Promise<{
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    minResolution: number;
    maxFileSize: number;
    formats: string[];
    aspectRatio: string;
    backgroundColor?: string;
    textSafeArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;

  // Error handling
  handleError(error: any): { code: string; message: string; retryable: boolean };
  isRetryableError(error: any): boolean;
  getErrorResolution(error: any): string;

  // Webhooks and callbacks
  validateWebhookSignature(headers: any, payload: any, secret: string): boolean;
  processWebhookEvent(payload: any): Promise<{ processed: boolean; message?: string }>;

  // Rate limiting and quotas
  getRateLimitInfo(): Promise<{
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  }>;

  // Maintenance and health checks
  checkHealth(): Promise<{
    healthy: boolean;
    status: 'operational' | 'degraded' | 'outage' | 'maintenance';
    message?: string;
    timestamp: Date;
    responseTime: number;
  }>;

  // Utility methods
  normalizeMetadata(metadata: any): any;
  formatTrackForDelivery(track: ITrack): any;
  parseDeliveryResponse(response: any): IStoreDelivery;
  parseReportData(data: any): IStoreDeliveryReport[];
}
