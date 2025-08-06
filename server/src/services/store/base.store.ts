import { IStore, IStoreDelivery, IStoreDeliveryReport } from '../../types/store';
import { ITrack } from '../../types/track';
import { IStoreIntegration } from './store.interface';

export abstract class BaseStoreIntegration implements IStoreIntegration {
  protected store: IStore;
  protected credentials: any;
  protected apiClient: any;

  constructor(store: IStore) {
    this.store = store;
    this.credentials = store.credentials;
    this.initializeApiClient();
  }

  protected abstract initializeApiClient(): void;

  // Default implementation for common methods
  async authenticate(credentials: any): Promise<{ authenticated: boolean; error?: string }> {
    try {
      // Default implementation - should be overridden by subclasses
      return { authenticated: true };
    } catch (error: any) {
      return { 
        authenticated: false, 
        error: error.message || 'Authentication failed' 
      };
    }
  }

  async validateTrack(track: ITrack): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Common validation logic that applies to all stores
    if (!track.metadata.title) {
      errors.push('Track title is required');
    }
    
    if (!track.primaryVersion?.audioFile) {
      errors.push('Audio file is required');
    }
    
    // Add more common validations as needed
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Abstract methods that must be implemented by subclasses
  abstract getStoreInfo(): Promise<any>;
  abstract refreshToken(): Promise<{ accessToken: string; expiresIn: number }>;
  abstract validateCredentials(credentials: any): Promise<{ valid: boolean; error?: string }>;
  abstract deliverTrack(track: ITrack, store: IStore): Promise<IStoreDelivery>;
  abstract updateTrack(track: ITrack, store: IStore): Promise<IStoreDelivery>;
  abstract removeTrack(trackId: string, store: IStore): Promise<{ success: boolean; message?: string }>;
  abstract getDeliveryStatus(deliveryId: string): Promise<{
    status: 'pending' | 'processing' | 'delivered' | 'failed';
    message?: string;
    externalId?: string;
    deliveredAt?: Date;
    metadata?: Record<string, any>;
  }>;
  abstract fetchReports(startDate: Date, endDate: Date): Promise<IStoreDeliveryReport[]>;
  abstract fetchDetailedReport(reportId: string): Promise<any>;
  
  // Default implementation for optional methods
  async fetchEarnings(startDate: Date, endDate: Date): Promise<{
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
  }> {
    // Default implementation - can be overridden by subclasses
    return {
      totalEarnings: 0,
      currency: 'USD',
      byTrack: [],
      byTerritory: {},
      byDate: []
    };
  }

  // Error handling utilities
  protected handleError(error: any): { code: string; message: string; retryable: boolean } {
    // Default error handling - should be extended by subclasses
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      retryable: false
    };
  }

  protected isRetryableError(error: any): boolean {
    // Default implementation - can be overridden by subclasses
    return false;
  }

  protected getErrorResolution(error: any): string {
    // Default implementation - can be overridden by subclasses
    return 'Please try again later or contact support if the problem persists.';
  }

  // Webhook handling
  validateWebhookSignature(headers: any, payload: any, secret: string): boolean {
    // Default implementation - should be overridden by subclasses
    return true;
  }

  async processWebhookEvent(payload: any): Promise<{ processed: boolean; message?: string }> {
    // Default implementation - should be overridden by subclasses
    return { processed: false, message: 'Webhook processing not implemented' };
  }

  // Rate limiting
  protected checkRateLimit(): void {
    // Default implementation - can be overridden by subclasses
  }

  // Helper methods
  protected formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected retry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
    return new Promise((resolve, reject) => {
      const attempt = (retryCount: number) => {
        fn()
          .then(resolve)
          .catch(error => {
            if (retryCount >= maxRetries || !this.isRetryableError(error)) {
              return reject(error);
            }
            setTimeout(() => attempt(retryCount + 1), delayMs * (retryCount + 1));
          });
      };
      attempt(0);
    });
  }
}
