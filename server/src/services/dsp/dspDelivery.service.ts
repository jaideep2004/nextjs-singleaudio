import crypto from 'crypto';
import Track from '../../models/track.model';
import DspProvider from '../../models/dspProvider.model';
import DeliveryJob, { IDeliveryJob } from '../../models/deliveryJob.model';
import DspWebhookEvent from '../../models/dspWebhookEvent.model';
import RightsClaim from '../../models/rightsClaim.model';
import FingerprintMatch from '../../models/fingerprintMatch.model';
import { DspDeliveryOperation, DspDeliveryState, DspIntegrationMode, DspTrackPayload } from '../../types/dsp';
import { dspRegistry } from './dspRegistry';
import { applyMetadataRules } from './rules/metadataRuleEngine';
import { releaseVersionService } from './releaseVersion.service';
import { evaluateDspReadiness, getDspRequirement } from './dspProviderRequirements';

const BASE_RETRY_DELAY_MS = 15_000;
const ALLOWED_WEBHOOK_STATES: DspDeliveryState[] = [
  'queued',
  'processing',
  'delivered',
  'failed',
  'needs_attention',
  'cancelled',
];

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown delivery error';

const getHeadersRecord = (headers: Record<string, unknown>): Record<string, string | string[] | undefined> => {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) out[key] = value.map(String);
    else if (value === undefined || value === null) out[key] = undefined;
    else out[key] = String(value);
  }
  return out;
};

const toPlainObject = (value: any): Record<string, any> =>
  typeof value?.toObject === 'function' ? value.toObject() : { ...value };

class DspDeliveryService {
  private buildProviderView(provider: any) {
    const plain = toPlainObject(provider);
    const requirement = getDspRequirement({
      key: plain.key,
      displayName: plain.displayName,
      capabilities: plain.capabilities,
    });
    const readiness = evaluateDspReadiness({
      key: plain.key,
      displayName: plain.displayName,
      capabilities: plain.capabilities,
      enabled: plain.enabled,
      maintenanceMode: plain.maintenanceMode,
      integrationMode: plain.integrationMode,
      config: plain.config,
      credentials: plain.credentials,
    });

    delete plain.credentials;
    return {
      ...plain,
      integrationMode: plain.integrationMode || plain.config?.integrationMode || 'shell',
      readiness: readiness.state,
      readinessReport: readiness,
      requirement,
    };
  }

  async bootstrapPhase1Providers() {
    const defaults = [
      { key: 'spotify', displayName: 'Spotify' },
      { key: 'apple_music', displayName: 'Apple Music' },
      { key: 'amazon_music', displayName: 'Amazon Music' },
      { key: 'youtube_music', displayName: 'YouTube Music' },
      { key: 'youtube_content_id', displayName: 'YouTube Content ID' },
      { key: 'youtube_music_video', displayName: 'YouTube Music Video' },
      { key: 'youtube_art_track', displayName: 'YouTube Art Track' },
      { key: 'tiktok', displayName: 'TikTok' },
      { key: 'deezer', displayName: 'Deezer' },
      { key: 'soundcloud', displayName: 'SoundCloud' },
      { key: 'tidal', displayName: 'TIDAL' },
    ];

    const created = [];
    for (const provider of defaults) {
      const result = await this.registerProvider({
        key: provider.key,
        displayName: provider.displayName,
        enabled: false,
        credentials: {},
        config: { integrationMode: 'shell', ddexProfile: 'ERN-4' },
      });
      created.push(result);
    }
    return created;
  }

  private scheduleRetry(jobId: string, retryCount: number): void {
    const delay = BASE_RETRY_DELAY_MS * (retryCount + 1);
    setTimeout(() => {
      this.processJob(jobId).catch(() => undefined);
    }, delay);
  }

  private buildTrackPayload(trackDoc: any): DspTrackPayload {
    return {
      trackId: trackDoc._id.toString(),
      title: trackDoc.title,
      artistName: trackDoc.artistName,
      isrc: trackDoc.isrc,
      upc: trackDoc.upc,
      genre: trackDoc.genre,
      language: trackDoc.language,
      explicit: trackDoc.explicit,
      releaseDate: trackDoc.releaseDate ? new Date(trackDoc.releaseDate).toISOString() : undefined,
      audioFile: trackDoc.audioFile,
      artwork: trackDoc.artwork,
      contributors: [
        {
          name: trackDoc.artistName,
          role: 'main_artist',
        },
      ],
      territories: ['WORLD'],
      contentRating: trackDoc.explicit ? 'explicit' : 'clean',
      ddexProfile: 'ERN-4',
      metadata: {
        source: 'track.model',
        trackStatus: trackDoc.status,
      },
    };
  }

  private generateIdempotencyKey(
    trackId: string,
    providerKey: string,
    operation: DspDeliveryOperation,
    versionNumber: number
  ): string {
    return crypto.createHash('sha256').update(`${trackId}:${providerKey}:${operation}:${versionNumber}`).digest('hex');
  }

  async registerProvider(input: {
    key: string;
    displayName: string;
    capabilities?: string[];
    region?: string;
    enabled?: boolean;
    maintenanceMode?: boolean;
    integrationMode?: DspIntegrationMode;
    credentials?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }) {
    const key = input.key.toLowerCase().trim();
    const connector = dspRegistry.get(key);
    const enabled = input.enabled ?? true;
    const integrationMode = input.integrationMode || (input.config?.integrationMode as DspIntegrationMode | undefined) || 'shell';
    if (enabled && integrationMode !== 'shell') {
      const validation = await connector.validateCredentials(input.credentials || {});
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid provider credentials');
      }
    }

    const readiness = evaluateDspReadiness({
      key,
      displayName: input.displayName || connector.displayName,
      capabilities: (input.capabilities || connector.capabilities) as any,
      enabled,
      maintenanceMode: input.maintenanceMode ?? false,
      integrationMode,
      config: { ...(input.config || {}), integrationMode },
      credentials: input.credentials || {},
    });

    const provider = await DspProvider.findOneAndUpdate(
      { key },
      {
        key,
        displayName: input.displayName || connector.displayName,
        capabilities: input.capabilities || connector.capabilities,
        region: input.region,
        enabled,
        maintenanceMode: input.maintenanceMode ?? false,
        integrationMode,
        readiness: readiness.state,
        credentials: input.credentials || {},
        config: { ...(input.config || {}), integrationMode },
      },
      { upsert: true, new: true }
    ).select('+credentials');

    return this.buildProviderView(provider);
  }

  async listProviders() {
    const dbProviders = await DspProvider.find().sort({ displayName: 1 }).select('+credentials');
    if (dbProviders.length > 0) return dbProviders.map((provider) => this.buildProviderView(provider));

    return dspRegistry.list().map((connector) => ({
      key: connector.key,
      displayName: connector.displayName,
      capabilities: connector.capabilities,
      enabled: false,
      maintenanceMode: false,
      integrationMode: 'shell',
      readiness: 'paused',
      readinessReport: {
        state: 'paused',
        missing: [],
        warnings: ['Provider not bootstrapped yet'],
        canDispatch: false,
      },
      requirement: getDspRequirement(connector),
      region: null,
      config: {},
    }));
  }

  async dispatchDelivery(trackId: string, providerKey: string, operation: DspDeliveryOperation, createdBy?: string) {
    const provider = await DspProvider.findOne({ key: providerKey, enabled: true });
    if (!provider) throw new Error(`Provider ${providerKey} is not active`);
    if (provider.maintenanceMode) throw new Error(`Provider ${providerKey} is in maintenance mode`);

    const track = await Track.findById(trackId);
    if (!track) throw new Error('Track not found');

    const payload = this.buildTrackPayload(track);
    const connector = dspRegistry.get(providerKey);
    const ruleResult = applyMetadataRules(providerKey, payload);
    if (!ruleResult.valid) {
      throw new Error(`Metadata/DDEX validation failed: ${ruleResult.errors.join(', ')}`);
    }

    const version = await releaseVersionService.createVersion({
      trackId,
      providerKey,
      payload: ruleResult.normalized,
      createdBy,
    });

    const idempotencyKey = this.generateIdempotencyKey(trackId, providerKey, operation, version.versionNumber);
    const existing = await DeliveryJob.findOne({ idempotencyKey });
    if (existing && ['queued', 'processing', 'delivered'].includes(existing.state)) {
      return existing;
    }

    const validation = await connector.validateTrack(ruleResult.normalized);
    if (!validation.valid) {
      throw new Error(`Connector validation failed: ${validation.errors.join(', ')}`);
    }

    const job = await DeliveryJob.create({
      trackId: track._id,
      providerKey,
      operation,
      state: 'queued',
      idempotencyKey,
      retryCount: 0,
      maxRetries: 5,
      metadata: {
        deliverySnapshot: {
          title: ruleResult.normalized.title,
          artistName: ruleResult.normalized.artistName,
          isrc: ruleResult.normalized.isrc,
        },
        releaseVersion: {
          versionNumber: version.versionNumber,
          versionLabel: version.versionLabel,
          ddexProfile: version.ddexProfile,
        },
        metadataWarnings: ruleResult.warnings,
      },
      createdBy,
      events: [
        {
          state: 'queued',
          message: `Delivery job created with ${version.versionLabel}`,
          source: 'system',
        },
      ],
    });

    void this.processJob(job._id.toString());
    return job;
  }

  async processJob(jobId: string): Promise<IDeliveryJob | null> {
    const job = await DeliveryJob.findById(jobId);
    if (!job) return null;
    if (job.deadLettered) return job;

    const provider = await DspProvider.findOne({ key: job.providerKey }).select('+credentials');
    if (!provider || !provider.enabled || provider.maintenanceMode) {
      await DeliveryJob.findByIdAndUpdate(jobId, {
        state: 'needs_attention',
        errorMessage: 'Provider inactive or in maintenance mode',
        $push: { events: { state: 'needs_attention', message: 'Provider unavailable', source: 'system' } },
      });
      return DeliveryJob.findById(jobId);
    }

    if (job.targetType === 'release') {
      await DeliveryJob.findByIdAndUpdate(jobId, {
        state: 'needs_attention',
        errorMessage: 'Release-level partner adapter is not connected yet',
        $push: {
          events: {
            state: 'needs_attention',
            message: 'Release package snapshot is ready. Connect live partner adapter before dispatch.',
            source: 'system',
          },
        },
      });
      return DeliveryJob.findById(jobId);
    }

    const readiness = evaluateDspReadiness({
      key: provider.key,
      displayName: provider.displayName,
      capabilities: provider.capabilities,
      enabled: provider.enabled,
      maintenanceMode: provider.maintenanceMode,
      integrationMode: provider.integrationMode,
      config: provider.config,
      credentials: provider.credentials,
    });
    if (!readiness.canDispatch) {
      await DeliveryJob.findByIdAndUpdate(jobId, {
        state: 'needs_attention',
        errorMessage: `Provider not ready: ${readiness.state}`,
        metadata: {
          ...job.metadata,
          readiness,
        },
        $push: {
          events: {
            state: 'needs_attention',
            message: readiness.missing.length
              ? `Missing provider readiness fields: ${readiness.missing.join(', ')}`
              : `Provider readiness state: ${readiness.state}`,
            source: 'system',
          },
        },
      });
      return DeliveryJob.findById(jobId);
    }

    const track = await Track.findById(job.trackId);
    if (!track) {
      await DeliveryJob.findByIdAndUpdate(jobId, {
        state: 'failed',
        errorMessage: 'Track not found',
        $push: { events: { state: 'failed', message: 'Track missing', source: 'system' } },
      });
      return DeliveryJob.findById(jobId);
    }

    const connector = dspRegistry.get(job.providerKey);
    const payload = this.buildTrackPayload(track);
    const ruleResult = applyMetadataRules(job.providerKey, payload);
    if (!ruleResult.valid) {
      await DeliveryJob.findByIdAndUpdate(jobId, {
        state: 'failed',
        errorMessage: `Metadata/DDEX validation failed: ${ruleResult.errors.join(', ')}`,
        $push: {
          events: {
            state: 'failed',
            message: 'Blocked by metadata rule engine',
            source: 'system',
          },
        },
      });
      return DeliveryJob.findById(jobId);
    }

    await DeliveryJob.findByIdAndUpdate(jobId, {
      state: 'processing',
      $push: { events: { state: 'processing', message: 'Connector dispatch started', source: 'system' } },
    });

    try {
      let result;
      if (job.operation === 'deliver') {
        result = await connector.deliver(ruleResult.normalized, {
          providerKey: provider.key,
          credentials: provider.credentials,
          region: provider.region,
          config: provider.config,
          operation: job.operation,
        });
      } else if (job.operation === 'update' && connector.update) {
        result = await connector.update(ruleResult.normalized, {
          providerKey: provider.key,
          credentials: provider.credentials,
          region: provider.region,
          config: provider.config,
          operation: job.operation,
        });
      } else if (job.operation === 'takedown' && connector.takedown) {
        result = await connector.takedown(ruleResult.normalized, {
          providerKey: provider.key,
          credentials: provider.credentials,
          region: provider.region,
          config: provider.config,
          operation: job.operation,
        });
      } else {
        throw new Error(`Connector ${job.providerKey} does not support operation ${job.operation}`);
      }

      const finalState: DspDeliveryState = result.state;
      const successLike = ['processing', 'delivered'].includes(finalState);
      await DeliveryJob.findByIdAndUpdate(jobId, {
        state: finalState,
        externalId: result.externalId,
        errorMessage: successLike ? undefined : result.message,
        metadata: {
          ...job.metadata,
          connectorMetadata: result.metadata || {},
        },
        $push: {
          attempts: {
            attemptNo: job.retryCount + 1,
            status: successLike ? 'success' : 'failed',
            responseCode: successLike ? 'ACCEPTED' : 'FAILED',
            requestHash: crypto.createHash('sha256').update(JSON.stringify(ruleResult.normalized)).digest('hex'),
            responseBody: result,
            retryable: finalState === 'failed',
          },
          events: {
            state: finalState,
            message: result.message || `Connector returned ${finalState}`,
            source: 'connector',
          },
        },
      });
      return DeliveryJob.findById(jobId);
    } catch (error) {
      const message = getErrorMessage(error);
      const retryCount = job.retryCount + 1;
      const shouldRetry = retryCount <= job.maxRetries;
      const nextRetryAt = shouldRetry ? new Date(Date.now() + BASE_RETRY_DELAY_MS * retryCount) : undefined;

      await DeliveryJob.findByIdAndUpdate(jobId, {
        state: shouldRetry ? 'queued' : 'failed',
        retryCount,
        nextRetryAt,
        deadLettered: !shouldRetry,
        errorMessage: message,
        $push: {
          attempts: {
            attemptNo: retryCount,
            status: 'failed',
            errorMessage: message,
            retryable: shouldRetry,
          },
          events: {
            state: shouldRetry ? 'queued' : 'failed',
            message: shouldRetry ? `Retry scheduled: ${message}` : `Dead-lettered: ${message}`,
            source: 'system',
          },
        },
      });

      if (shouldRetry) {
        this.scheduleRetry(jobId, retryCount);
      }
      return DeliveryJob.findById(jobId);
    }
  }

  async retryJob(jobId: string) {
    const job = await DeliveryJob.findById(jobId);
    if (!job) throw new Error('Delivery job not found');
    await DeliveryJob.findByIdAndUpdate(jobId, {
      state: 'queued',
      deadLettered: false,
      errorMessage: undefined,
      $push: { events: { state: 'queued', message: 'Manual retry requested', source: 'user' } },
    });
    void this.processJob(jobId);
    return DeliveryJob.findById(jobId);
  }

  async listJobs(filters: { providerKey?: string; state?: string; page?: number; limit?: number }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const query: Record<string, unknown> = {};
    if (filters.providerKey) query.providerKey = filters.providerKey;
    if (filters.state) query.state = filters.state;

    const [items, total] = await Promise.all([
      DeliveryJob.find(query)
        .populate('trackId', 'title artistName isrc')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      DeliveryJob.countDocuments(query),
    ]);

    return {
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getJob(jobId: string) {
    return DeliveryJob.findById(jobId).populate('trackId', 'title artistName isrc stores');
  }

  async processWebhook(providerKey: string, payload: Record<string, unknown>, headers: Record<string, unknown>) {
    const provider = await DspProvider.findOne({ key: providerKey });
    if (!provider) throw new Error('Provider not found');

    const connector = dspRegistry.get(providerKey);
    const signatureValid = connector.validateWebhookSignature
      ? connector.validateWebhookSignature(getHeadersRecord(headers), payload, String(provider.config?.webhookSecret || ''))
      : true;

    const event = await DspWebhookEvent.create({
      providerKey,
      eventType: typeof payload.eventType === 'string' ? payload.eventType : undefined,
      signatureValid,
      payload,
      headers: getHeadersRecord(headers),
      processed: false,
    });

    if (!signatureValid) {
      event.processingError = 'Invalid webhook signature';
      await event.save();
      throw new Error('Invalid webhook signature');
    }

    const externalId = typeof payload.externalId === 'string' ? payload.externalId : undefined;
    if (externalId) {
      const state =
        typeof payload.state === 'string' && ALLOWED_WEBHOOK_STATES.includes(payload.state as DspDeliveryState)
          ? (payload.state as DspDeliveryState)
          : 'processing';
      await DeliveryJob.findOneAndUpdate(
        { providerKey, externalId },
        {
          state,
          $push: {
            events: {
              state,
              message: typeof payload.message === 'string' ? payload.message : 'Webhook update received',
              source: 'webhook',
            },
          },
        }
      );
    }

    event.processed = true;
    await event.save();
    return event;
  }

  async createRightsClaim(input: {
    trackId: string;
    providerKey: string;
    policyAction: 'monitor' | 'claim' | 'block' | 'monetize';
    evidence?: Record<string, unknown>;
  }) {
    return RightsClaim.create({
      trackId: input.trackId,
      providerKey: input.providerKey,
      policyAction: input.policyAction,
      evidence: input.evidence || {},
    });
  }

  async addFingerprintMatch(input: {
    trackId: string;
    providerKey: string;
    confidence: number;
    matchType: 'audio' | 'video' | 'ugc';
    payload?: Record<string, unknown>;
  }) {
    return FingerprintMatch.create({
      trackId: input.trackId,
      providerKey: input.providerKey,
      confidence: input.confidence,
      matchType: input.matchType,
      payload: input.payload || {},
    });
  }
}

export const dspDeliveryService = new DspDeliveryService();
