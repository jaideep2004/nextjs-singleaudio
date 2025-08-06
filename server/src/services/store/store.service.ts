import { Service } from 'typedi';
import { Model } from 'mongoose';
import { InjectModel } from 'typegoose';
import { IStore, StoreType, IStoreDelivery, IStoreDeliveryReport } from '../../types/store';
import { ITrack } from '../../types/track';
import { storeFactory } from './store.factory';
import { logger } from '../../utils/logger';
import { BaseService } from '../base.service.impl';
import { StoreRepository } from '../../repositories/store.repository';
import { StoreDeliveryRepository } from '../../repositories/store-delivery.repository';
import { StoreDeliveryReportRepository } from '../../repositories/store-delivery-report.repository';

@Service()
export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly storeDeliveryRepository: StoreDeliveryRepository,
    private readonly storeDeliveryReportRepository: StoreDeliveryReportRepository
  ) {}

  async getStoreById(storeId: string): Promise<IStore | null> {
    return this.storeRepository.findById(storeId);
  }

  async getStoresByType(type: StoreType): Promise<IStore[]> {
    return this.storeRepository.find({ type });
  }

  async getActiveStores(): Promise<IStore[]> {
    return this.storeRepository.find({ isActive: true });
  }

  async registerStore(storeData: Partial<IStore>): Promise<IStore> {
    // Validate store type
    const supportedTypes = storeFactory.getSupportedStores();
    if (!supportedTypes.includes(storeData.type as StoreType)) {
      throw new Error(`Unsupported store type: ${storeData.type}`);
    }

    // Create store record
    const store = await this.storeRepository.create(storeData);
    
    // Test the connection
    await this.testStoreConnection(store._id.toString());
    
    return store;
  }

  async updateStore(storeId: string, updateData: Partial<IStore>): Promise<IStore | null> {
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    // Update store data
    const updatedStore = await this.storeRepository.update(storeId, updateData);
    
    // Test the connection if credentials were updated
    if (updateData.credentials) {
      await this.testStoreConnection(storeId);
    }
    
    return updatedStore;
  }

  async deleteStore(storeId: string): Promise<boolean> {
    // Check if there are any active deliveries for this store
    const activeDeliveries = await this.storeDeliveryRepository.count({
      storeId,
      status: { $in: ['pending', 'processing'] }
    });
    
    if (activeDeliveries > 0) {
      throw new Error('Cannot delete store with active deliveries');
    }
    
    return this.storeRepository.softDelete(storeId);
  }

  async testStoreConnection(storeId: string): Promise<{ connected: boolean; error?: string }> {
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }
    
    try {
      const integration = storeFactory.getIntegration(store);
      const result = await integration.validateCredentials(store.credentials);
      
      // Update store status
      await this.storeRepository.update(storeId, { 
        lastTestedAt: new Date(),
        lastTestStatus: result.valid ? 'success' : 'failed',
        lastError: result.error,
        isActive: result.valid
      });
      
      return { 
        connected: result.valid, 
        error: result.error 
      };
    } catch (error) {
      logger.error('Store connection test failed', { storeId, error });
      
      await this.storeRepository.update(storeId, { 
        lastTestedAt: new Date(),
        lastTestStatus: 'failed',
        lastError: error.message,
        isActive: false
      });
      
      return { 
        connected: false, 
        error: error.message 
      };
    }
  }

  async deliverToStore(track: ITrack, storeId: string): Promise<IStoreDelivery> {
    const store = await this.getStoreById(storeId);
    if (!store || !store.isActive) {
      throw new Error('Store not found or inactive');
    }
    
    // Check if track is already delivered to this store
    const existingDelivery = await this.storeDeliveryRepository.findOne({
      trackId: track._id.toString(),
      storeId: store._id.toString(),
      status: { $in: ['pending', 'processing', 'delivered'] }
    });
    
    if (existingDelivery) {
      return this.getDeliveryStatus(existingDelivery._id.toString());
    }
    
    try {
      // Create pending delivery record
      const delivery = await this.storeDeliveryRepository.create({
        trackId: track._id.toString(),
        storeId: store._id.toString(),
        status: 'pending',
        metadata: {}
      });
      
      // Process delivery in the background
      this.processDelivery(delivery._id.toString(), track, store);
      
      return delivery;
    } catch (error) {
      logger.error('Failed to create delivery record', { trackId: track._id, storeId, error });
      throw error;
    }
  }

  private async processDelivery(deliveryId: string, track: ITrack, store: IStore): Promise<void> {
    try {
      // Update status to processing
      await this.storeDeliveryRepository.update(deliveryId, { 
        status: 'processing',
        startedAt: new Date()
      });
      
      // Get store integration
      const integration = storeFactory.getIntegration(store);
      
      // Deliver track to store
      const result = await integration.deliverTrack(track, store);
      
      // Update delivery status
      await this.storeDeliveryRepository.update(deliveryId, {
        status: 'delivered',
        externalId: result.externalId,
        deliveredAt: new Date(),
        lastChecked: new Date(),
        metadata: {
          ...result.metadata,
          storeType: store.type
        }
      });
      
      logger.info('Track delivered successfully', { 
        trackId: track._id, 
        storeId: store._id,
        deliveryId
      });
      
    } catch (error) {
      logger.error('Failed to process delivery', { 
        deliveryId, 
        trackId: track._id, 
        storeId: store._id,
        error: error.message 
      });
      
      // Update delivery status to failed
      await this.storeDeliveryRepository.update(deliveryId, { 
        status: 'failed',
        error: error.message,
        lastChecked: new Date()
      });
      
      // TODO: Implement retry logic for failed deliveries
    }
  }

  async getDeliveryStatus(deliveryId: string): Promise<IStoreDelivery> {
    const delivery = await this.storeDeliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    
    // If already delivered or failed, return current status
    if (['delivered', 'failed'].includes(delivery.status)) {
      return delivery;
    }
    
    // Check status with the store
    const store = await this.getStoreById(delivery.storeId);
    if (!store) {
      throw new Error('Store not found');
    }
    
    try {
      const integration = storeFactory.getIntegration(store);
      const status = await integration.getDeliveryStatus(delivery.externalId || '');
      
      // Update delivery status
      const updateData: Partial<IStoreDelivery> = {
        status: status.status,
        lastChecked: new Date(),
        ...(status.externalId && { externalId: status.externalId }),
        ...(status.deliveredAt && { deliveredAt: status.deliveredAt }),
        ...(status.message && { error: status.message }),
        metadata: {
          ...delivery.metadata,
          ...status.metadata
        }
      };
      
      await this.storeDeliveryRepository.update(deliveryId, updateData);
      
      return {
        ...delivery.toObject(),
        ...updateData
      };
      
    } catch (error) {
      logger.error('Failed to check delivery status', { deliveryId, error });
      
      // Update last checked timestamp
      await this.storeDeliveryRepository.update(deliveryId, { 
        lastChecked: new Date() 
      });
      
      return delivery;
    }
  }

  async syncStoreReports(storeId: string, startDate: Date, endDate: Date): Promise<void> {
    const store = await this.getStoreById(storeId);
    if (!store || !store.isActive) {
      throw new Error('Store not found or inactive');
    }
    
    try {
      const integration = storeFactory.getIntegration(store);
      const reports = await integration.fetchReports(startDate, endDate);
      
      // Save reports to database
      await Promise.all(reports.map(report => 
        this.storeDeliveryReportRepository.create(report)
      ));
      
      // Update last sync timestamp
      await this.storeRepository.update(storeId, { 
        lastSyncedAt: new Date() 
      });
      
      logger.info('Store reports synced successfully', { 
        storeId,
        reportCount: reports.length,
        startDate,
        endDate
      });
      
    } catch (error) {
      logger.error('Failed to sync store reports', { storeId, error });
      
      // Update sync status with error
      await this.storeRepository.update(storeId, { 
        lastSyncStatus: 'failed',
        lastError: error.message,
        lastSyncedAt: new Date()
      });
      
      throw error;
    }
  }

  async getStoreEarnings(storeId: string, startDate: Date, endDate: Date): Promise<{
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
    const store = await this.getStoreById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }
    
    try {
      const integration = storeFactory.getIntegration(store);
      
      // Try to get earnings directly from the integration if available
      if (typeof integration.fetchEarnings === 'function') {
        return integration.fetchEarnings(startDate, endDate);
      }
      
      // Fallback to database if integration doesn't support direct earnings fetch
      const reports = await this.storeDeliveryReportRepository.find({
        storeId,
        reportDate: { $gte: startDate, $lte: endDate }
      });n      
      // Process reports to calculate earnings
      const earningsByTrack = new Map<string, { 
        trackTitle: string; 
        earnings: number; 
        streams: number; 
        downloads: number; 
      }>();
      
      const earningsByTerritory = new Map<string, { earnings: number; currency: string }>();
      const earningsByDate = new Map<string, number>();
      
      let totalEarnings = 0;
      let currency = 'USD';
      
      for (const report of reports) {
        // Skip reports with no revenue
        if (!report.revenue) continue;
        
        // Track total earnings
        totalEarnings += report.revenue;
        currency = report.currency || currency;
        
        // Track earnings by track
        const trackKey = report.trackId;
        const trackEarnings = earningsByTrack.get(trackKey) || { 
          trackTitle: report.trackTitle || `Track ${report.trackId}`, 
          earnings: 0, 
          streams: 0, 
          downloads: 0 
        };
        
        trackEarnings.earnings += report.revenue;
        trackEarnings.streams += report.streams || 0;
        trackEarnings.downloads += report.downloads || 0;
        earningsByTrack.set(trackKey, trackEarnings);
        
        // Track earnings by territory (if available)
        if (report.territory) {
          const territoryEarnings = earningsByTerritory.get(report.territory) || { 
            earnings: 0, 
            currency: report.currency || 'USD' 
          };
          territoryEarnings.earnings += report.revenue;
          earningsByTerritory.set(report.territory, territoryEarnings);
        }
        
        // Track earnings by date
        const dateKey = report.reportDate.toISOString().split('T')[0];
        earningsByDate.set(dateKey, (earningsByDate.get(dateKey) || 0) + report.revenue);
      }
      
      // Convert maps to required formats
      const byTrack = Array.from(earningsByTrack.entries()).map(([trackId, data]) => ({
        trackId,
        ...data
      }));
      
      const byTerritory = Object.fromEntries(earningsByTerritory);
      
      const byDate = Array.from(earningsByDate.entries())
        .map(([date, earnings]) => ({
          date: new Date(date),
          earnings
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      return {
        totalEarnings,
        currency,
        byTrack,
        byTerritory,
        byDate
      };
      
    } catch (error) {
      logger.error('Failed to get store earnings', { storeId, error });
      throw error;
    }
  }
}
