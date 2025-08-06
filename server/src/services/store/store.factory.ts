import { IStore, StoreType } from '../../types/store';
import { IStoreIntegration } from './store.interface';
import { SpotifyStoreIntegration } from './integrations/spotify.store';
import { AppleMusicStoreIntegration } from './integrations/apple-music.store';
import { YoutubeContentIdStoreIntegration } from './integrations/youtube-content-id.store';
import { logger } from '../../utils/logger';

type StoreConstructor = new (store: IStore) => IStoreIntegration;

class StoreFactory {
  private static instance: StoreFactory;
  private integrations: Map<StoreType, StoreConstructor> = new Map();

  private constructor() {
    this.initializeDefaultIntegrations();
  }

  public static getInstance(): StoreFactory {
    if (!StoreFactory.instance) {
      StoreFactory.instance = new StoreFactory();
    }
    return StoreFactory.instance;
  }

  private initializeDefaultIntegrations(): void {
    try {
      // Register default store integrations
      this.registerIntegration(StoreType.STREAMING, SpotifyStoreIntegration);
      this.registerIntegration(StoreType.STREAMING, AppleMusicStoreIntegration);
      this.registerIntegration(StoreType.YOUTUBE, YoutubeContentIdStoreIntegration);
      
      logger.info('Default store integrations initialized');
    } catch (error) {
      logger.error('Failed to initialize store integrations', { error });
      throw error;
    }
  }

  public registerIntegration(type: StoreType, integration: StoreConstructor): void {
    if (this.integrations.has(type)) {
      logger.warn(`Integration for store type ${type} is already registered and will be overwritten`);
    }
    this.integrations.set(type, integration);
    logger.info(`Registered integration for store type: ${type}`);
  }

  public getIntegration(store: IStore): IStoreIntegration {
    const { type } = store;
    const Integration = this.integrations.get(type as StoreType);

    if (!Integration) {
      throw new Error(`No integration found for store type: ${type}`);
    }

    try {
      return new Integration(store);
    } catch (error) {
      logger.error(`Failed to initialize integration for store type: ${type}`, { error });
      throw new Error(`Failed to initialize store integration: ${error.message}`);
    }
  }

  public getSupportedStores(): StoreType[] {
    return Array.from(this.integrations.keys());
  }
}

export const storeFactory = StoreFactory.getInstance();
